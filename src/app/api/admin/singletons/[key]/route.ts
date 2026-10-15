import { getSingleton, updateSingleton } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bad, json, pick, refreshSite, singletonAdminOnly, singletonFields } from "@/lib/api";
import { maskSecrets, unmaskSecrets } from "@/lib/integrations";
import type { Integrations, SingletonKey } from "@/lib/types";

type Ctx = { params: Promise<{ key: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { key } = await params;
  const [, err] = await requireUser(singletonAdminOnly(key) ? "admin" : undefined);
  if (err) return err;
  if (!singletonFields(key)) return bad("Unknown page", 404);
  const data = getSingleton(key as SingletonKey);
  return json(key === "integrations" ? maskSecrets(data as Integrations) : data);
}

export async function PUT(req: Request, { params }: Ctx) {
  const { key } = await params;
  const [, err] = await requireUser(singletonAdminOnly(key) ? "admin" : undefined);
  if (err) return err;
  const fields = singletonFields(key);
  if (!fields) return bad("Unknown page", 404);
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return bad("Invalid body");
  let data = pick(body, fields);
  if (key === "integrations") data = unmaskSecrets(data, getSingleton("integrations"));
  const updated = await updateSingleton(key as SingletonKey, data as any);
  refreshSite();
  return json(key === "integrations" ? maskSecrets(updated as Integrations) : updated);
}
