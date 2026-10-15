import archiver from "archiver";
import { PassThrough, Readable } from "node:stream";
import { findDoc } from "@/lib/db";
import { accessibleGallery } from "@/lib/gallery";
import { loadSource } from "@/lib/images";
import type { Media } from "@/lib/types";

export const runtime = "nodejs";

/** Prefer the full-resolution original of an uploaded file. */
function originalOf(url: string) {
  const m = findDoc<Media>("media", "url", url);
  return m?.original || url;
}
const extOf = (u: string) => (/\.(jpe?g|png|webp|avif|gif)(\?|$)/i.exec(u)?.[1] || "jpg").toLowerCase();
const safe = (s: string) => s.replace(/[^\w-]+/g, "-").replace(/^-|-$/g, "") || "gallery";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { gallery } = await accessibleGallery(slug);
  if (!gallery) return new Response("Locked", { status: 401 });
  if (!gallery.allowDownload) return new Response("Downloads are disabled for this gallery", { status: 403 });
  const url = new URL(req.url);
  const name = safe(gallery.title);

  if (url.searchParams.get("all") || url.searchParams.get("favorites")) {
    const list = url.searchParams.get("favorites") ? gallery.favorites || [] : gallery.images;
    const zip = archiver("zip", { store: true });
    const out = new PassThrough();
    zip.pipe(out);
    (async () => {
      let n = 0;
      for (const img of list) {
        n++;
        try {
          const src = originalOf(img);
          zip.append(await loadSource(src), { name: `${name}-${String(n).padStart(3, "0")}.${extOf(src)}` });
        } catch {
          /* skip unavailable files */
        }
      }
      await zip.finalize();
    })();
    return new Response(Readable.toWeb(out) as any, {
      headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${name}.zip"` },
    });
  }

  const i = Number(url.searchParams.get("i"));
  const img = gallery.images[i];
  if (!img) return new Response("Not found", { status: 404 });
  try {
    const src = originalOf(img);
    const buf = await loadSource(src);
    const ext = extOf(src);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg",
        "Content-Disposition": `attachment; filename="${name}-${String(i + 1).padStart(3, "0")}.${ext}"`,
      },
    });
  } catch (e: any) {
    return new Response(e?.message || "Unavailable", { status: 502 });
  }
}
