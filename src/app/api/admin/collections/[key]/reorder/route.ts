import { reorderDocs } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bad, json, refreshSite, writableFields } from "@/lib/api";
import type { CollectionKey } from "@/lib/types";

export async function POST(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const [, err] = await requireUser();
  if (err) return err;
  const { key } = await params;
  if (!writableFields(key)) return bad("Unknown collection", 404);
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body?.ids)) return bad("ids[] required");
  await reorderDocs(key as CollectionKey, body.ids.map(String));
  refreshSite();
  return json({ ok: true });
}
