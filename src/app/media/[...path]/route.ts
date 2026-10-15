import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/db";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
};

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const name = path.basename(parts.join("/"));
  const file = path.join(UPLOAD_DIR, name);
  if (!file.startsWith(UPLOAD_DIR) || !fs.existsSync(file)) return new Response("Not found", { status: 404 });

  const stat = fs.statSync(file);
  const type = TYPES[name.split(".").pop()?.toLowerCase() || ""] || "application/octet-stream";
  const headers: Record<string, string> = {
    "Content-Type": type,
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
  };
  if (type === "image/svg+xml") headers["Content-Security-Policy"] = "script-src 'none'";

  // Range requests so uploaded videos can be scrubbed
  const range = req.headers.get("range");
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    const start = m?.[1] ? parseInt(m[1], 10) : 0;
    const end = m?.[2] ? Math.min(parseInt(m[2], 10), stat.size - 1) : stat.size - 1;
    if (start >= stat.size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${stat.size}` } });
    const stream = fs.createReadStream(file, { start, end });
    return new Response(stream as any, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${stat.size}`, "Content-Length": String(end - start + 1) },
    });
  }
  return new Response(fs.createReadStream(file) as any, { headers: { ...headers, "Content-Length": String(stat.size) } });
}
