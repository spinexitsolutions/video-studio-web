import { deleteDoc, getDoc, listDocs, updateDoc } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bad, isKnownCollection, json, pick, refreshSite, slugify, writableFields } from "@/lib/api";
import type { CollectionKey } from "@/lib/types";

type Ctx = { params: Promise<{ key: string; id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const [, err] = await requireUser();
  if (err) return err;
  const { key, id } = await params;
  if (!isKnownCollection(key)) return bad("Unknown collection", 404);
  const doc = getDoc(key as CollectionKey, id);
  return doc ? json(doc) : bad("Not found", 404);
}

export async function PUT(req: Request, { params }: Ctx) {
  const [, err] = await requireUser();
  if (err) return err;
  const { key, id } = await params;
  const fields = writableFields(key);
  if (!fields) return bad("Unknown collection", 404);
  if (!fields.length) return bad("This list is read-only", 403);
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return bad("Invalid body");
  const data = pick(body, fields);
  if (typeof data.slug === "string") {
    data.slug = slugify(data.slug) || slugify(data.title || data.name || "item");
    if (listDocs(key as CollectionKey).some((d) => d.slug === data.slug && d.id !== id)) {
      return bad(`The URL slug "${data.slug}" is already used by another item.`, 409);
    }
  }
  const doc = await updateDoc(key as CollectionKey, id, data);
  if (!doc) return bad("Not found", 404);
  refreshSite();
  return json(doc);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const [, err] = await requireUser();
  if (err) return err;
  const { key, id } = await params;
  if (!isKnownCollection(key)) return bad("Unknown collection", 404);
  const ok = await deleteDoc(key as CollectionKey, id);
  refreshSite();
  return ok ? json({ ok: true }) : bad("Not found", 404);
}
