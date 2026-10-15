import { getSingleton } from "@/lib/db";
import { accessibleGallery } from "@/lib/gallery";
import { renderImage } from "@/lib/images";

export const runtime = "nodejs";

/** Gallery previews — resized and (optionally) watermarked on the server, so clean files never reach the page. */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { gallery } = await accessibleGallery(slug);
  if (!gallery) return new Response("Locked", { status: 401 });
  const url = new URL(req.url);
  const i = Number(url.searchParams.get("i"));
  const w = Number(url.searchParams.get("w")) || 1600;
  const src = gallery.images[i];
  if (!src) return new Response("Not found", { status: 404 });
  try {
    const buf = await renderImage(src, w, gallery.watermark ? getSingleton("settings").logoText || getSingleton("settings").siteName : undefined);
    return new Response(new Uint8Array(buf), { headers: { "Content-Type": "image/webp", "Cache-Control": "private, max-age=86400" } });
  } catch (e: any) {
    return new Response(e?.message || "Image unavailable", { status: 502 });
  }
}
