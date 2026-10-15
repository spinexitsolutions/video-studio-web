import { findDoc } from "./db";
import { getCurrentUser } from "./auth";
import { hasGalleryAccess } from "./gallery-auth";
import type { Gallery } from "./types";

export const galleryExpired = (g: Gallery) => !!g.expiresAt && g.expiresAt < new Date().toISOString().slice(0, 10);

/** Returns the gallery if the visitor may open it (client cookie or signed-in studio staff). */
export async function accessibleGallery(slug: string): Promise<{ gallery: Gallery | null; reason?: "missing" | "locked" | "expired" }> {
  const g = findDoc<Gallery>("galleries", "slug", slug);
  if (!g || g.published === false) return { gallery: null, reason: "missing" };
  const staff = await getCurrentUser();
  if (staff) return { gallery: g };
  if (galleryExpired(g)) return { gallery: null, reason: "expired" };
  if (!(await hasGalleryAccess(g.id))) return { gallery: null, reason: "locked" };
  return { gallery: g };
}
