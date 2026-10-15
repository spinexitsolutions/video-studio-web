import { updateDoc } from "@/lib/db";
import { bad, json } from "@/lib/api";
import { accessibleGallery } from "@/lib/gallery";
import { notifyStudio, webhook } from "@/lib/mailer";
import { baseUrl } from "@/lib/url";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { gallery } = await accessibleGallery(slug);
  if (!gallery) return bad("Gallery locked", 401);
  const { note } = await req.json().catch(() => ({}));
  const submittedAt = new Date().toISOString();
  await updateDoc("galleries", gallery.id, { clientNote: String(note || "").slice(0, 3000), selectionSubmittedAt: submittedAt });
  const vars = { name: gallery.clientName || "Your client", gallery: gallery.title, count: (gallery.favorites || []).length, note: note || "—", adminUrl: `${await baseUrl()}/admin/content/galleries/${gallery.id}` };
  notifyStudio("selectionAdmin", vars);
  webhook("gallery.selection_submitted", { gallery: gallery.title, client: gallery.clientName, favorites: gallery.favorites, note });
  return json({ ok: true, submittedAt });
}
