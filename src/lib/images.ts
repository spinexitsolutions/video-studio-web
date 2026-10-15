import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { DATA_DIR, UPLOAD_DIR, newId } from "./db";
import { cloudinaryReady, integrations } from "./integrations";

const CACHE_DIR = path.join(DATA_DIR, "cache");
const RASTER = /^image\/(jpeg|png|webp|avif)$/;
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
};
export const ALLOWED_MIME = Object.keys(EXT);

export interface StoredFile {
  filename: string;
  url: string; // optimized, used on the website
  original: string; // full resolution, used for client downloads
  size: number;
  width?: number;
  height?: number;
  provider: "local" | "cloudinary";
}

async function uploadToCloudinary(buf: Buffer, mime: string, name: string): Promise<StoredFile> {
  const i = integrations();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = i.cloudinaryFolder || "studio";
  const signature = crypto.createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${i.cloudinaryApiSecret}`).digest("hex");
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buf)], { type: mime }), name);
  form.append("api_key", i.cloudinaryApiKey);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  form.append("signature", signature);
  const type = mime.startsWith("video/") ? "video" : "image";
  const res = await fetch(`https://api.cloudinary.com/v1_1/${i.cloudinaryCloudName}/${type}/upload`, { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) throw new Error(data?.error?.message || `Cloudinary upload failed (${res.status})`);
  return { filename: data.public_id, url: data.secure_url, original: data.secure_url, size: data.bytes, width: data.width, height: data.height, provider: "cloudinary" };
}

/** Stores an upload: Cloudinary when configured, otherwise on disk with an optimized WebP copy. */
export async function storeUpload(buf: Buffer, mime: string, name: string): Promise<StoredFile> {
  if (!EXT[mime]) throw new Error(`Unsupported file type: ${mime || "unknown"}`);
  if (cloudinaryReady()) return uploadToCloudinary(buf, mime, name);

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const id = newId();
  const original = `${id}.${EXT[mime]}`;
  await fs.writeFile(path.join(UPLOAD_DIR, original), buf);
  if (RASTER.test(mime) && integrations().optimizeUploads) {
    const img = sharp(buf, { failOn: "none" }).rotate();
    const meta = await img.metadata();
    const optimized = `${id}-web.webp`;
    const out = await img.resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    await fs.writeFile(path.join(UPLOAD_DIR, optimized), out);
    return { filename: optimized, url: `/media/${optimized}`, original: `/media/${original}`, size: out.length, width: meta.width, height: meta.height, provider: "local" };
  }
  return { filename: original, url: `/media/${original}`, original: `/media/${original}`, size: buf.length, provider: "local" };
}

/** Reads any image the CMS references (local upload or remote URL) into memory. */
export async function loadSource(url: string): Promise<Buffer> {
  if (url.startsWith("/media/")) {
    const name = path.basename(url.split("?")[0]);
    return fs.readFile(path.join(UPLOAD_DIR, name));
  }
  if (!/^https?:\/\//.test(url)) throw new Error("Unsupported image source");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image fetch failed (${res.status})`);
  const len = Number(res.headers.get("content-length") || 0);
  if (len > 40 * 1024 * 1024) throw new Error("Image too large");
  return Buffer.from(await res.arrayBuffer());
}

function watermarkSvg(width: number, height: number, text: string) {
  const size = Math.max(14, Math.round(width / 28));
  const step = size * 9;
  let rows = "";
  for (let y = -height; y < height * 2; y += step * 0.6) {
    for (let x = -width; x < width * 2; x += step) {
      rows += `<text x="${x}" y="${y}" font-size="${size}" font-family="Helvetica, Arial, sans-serif" font-weight="700" letter-spacing="${size * 0.25}" fill="white" fill-opacity="0.22" stroke="black" stroke-opacity="0.08">${text}</text>`;
    }
  }
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g transform="rotate(-28 ${width / 2} ${height / 2})">${rows}</g></svg>`);
}

/** Resized (and optionally watermarked) WebP, cached on disk. */
export async function renderImage(source: string, width: number, watermark?: string): Promise<Buffer> {
  const w = Math.min(2560, Math.max(160, Math.round(width)));
  const key = crypto.createHash("sha1").update(`${source}|${w}|${watermark || ""}`).digest("hex");
  const file = path.join(CACHE_DIR, `${key}.webp`);
  try {
    return await fs.readFile(file);
  } catch {}
  const input = await loadSource(source);
  let img = sharp(input, { failOn: "none" }).rotate().resize({ width: w, withoutEnlargement: true });
  if (watermark) {
    const { data, info } = await img.toBuffer({ resolveWithObject: true });
    img = sharp(data).composite([{ input: watermarkSvg(info.width, info.height, watermark.replace(/[<>&"]/g, "").toUpperCase()), top: 0, left: 0 }]);
  }
  const out = await img.webp({ quality: watermark ? 78 : 82 }).toBuffer();
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(file, out).catch(() => undefined);
  return out;
}
