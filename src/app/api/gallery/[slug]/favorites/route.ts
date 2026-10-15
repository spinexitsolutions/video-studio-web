import { transact } from "@/lib/db";
import { bad, json } from "@/lib/api";
import { accessibleGallery } from "@/lib/gallery";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { gallery } = await accessibleGallery(slug);
  if (!gallery) return bad("Gallery locked", 401);
  if (!gallery.allowFavorites) return bad("Favourites are turned off for this gallery", 403);
  const { image, on } = await req.json().catch(() => ({}));
  if (!gallery.images.includes(image)) return bad("Unknown photo");
  const favorites = await transact((db) => {
    const g = db.collections.galleries.find((x) => x.id === gallery.id)!;
    const set = new Set<string>(g.favorites || []);
    if (on) {
      if (gallery.maxSelections > 0 && set.size >= gallery.maxSelections && !set.has(image)) throw new Error(`You can choose up to ${gallery.maxSelections} photos.`);
      set.add(image);
    } else set.delete(image);
    g.favorites = gallery.images.filter((i) => set.has(i));
    g.updatedAt = new Date().toISOString();
    return g.favorites as string[];
  }).catch((e) => e as Error);
  if (favorites instanceof Error) return bad(favorites.message, 409);
  return json({ favorites });
}
