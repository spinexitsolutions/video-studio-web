import { getSingleton, updateSingleton } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bad, json, pick, refreshSite, singletonFields } from "@/lib/api";
import type { SingletonKey } from "@/lib/types";

type Ctx = { params: Promise<{ key: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const [, err] = await requireUser();
  if (err) return err;
  const { key } = await params;
  if (!singletonFields(key)) return bad("Unknown page", 404);
  return json(getSingleton(key as SingletonKey));
}

export async function PUT(req: Request, { params }: Ctx) {
  const [, err] = await requireUser();
  if (err) return err;
  const { key } = await params;
  const fields = singletonFields(key);
  if (!fields) return bad("Unknown page", 404);
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return bad("Invalid body");
  const updated = await updateSingleton(key as SingletonKey, pick(body, fields) as any);
  refreshSite();
  return json(updated);
}
