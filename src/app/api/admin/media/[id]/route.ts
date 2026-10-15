import fs from "node:fs/promises";
import path from "node:path";
import { deleteDoc, getDoc, updateDoc, UPLOAD_DIR } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bad, json } from "@/lib/api";
import type { Media } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const [, err] = await requireUser();
  if (err) return err;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const doc = await updateDoc("media", id, { alt: String(body.alt ?? "") });
  return doc ? json(doc) : bad("Not found", 404);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const [, err] = await requireUser();
  if (err) return err;
  const { id } = await params;
  const doc = getDoc<Media>("media", id);
  if (!doc) return bad("Not found", 404);
  await fs.rm(path.join(UPLOAD_DIR, path.basename(doc.filename)), { force: true });
  await deleteDoc("media", id);
  return json({ ok: true });
}
