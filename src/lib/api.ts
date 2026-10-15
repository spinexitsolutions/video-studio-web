import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCollectionConfig, getSingletonConfig } from "./cms-schema";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** Collections editable through the generic admin API, with their writable fields. */
export function writableFields(key: string): string[] | null {
  if (key === "bookings") return ["status", "notes", "name", "email", "phone", "service", "package", "date", "location", "budget", "message"];
  if (key === "subscribers") return ["email"];
  const cfg = getCollectionConfig(key);
  if (!cfg) return null;
  return ["order", ...cfg.groups.flatMap((g) => g.fields.map((f) => f.name))];
}

export function singletonFields(key: string): string[] | null {
  const cfg = getSingletonConfig(key);
  if (!cfg) return null;
  return cfg.groups.flatMap((g) => g.fields.map((f) => f.name));
}

export function pick(data: Record<string, any>, fields: string[]) {
  const out: Record<string, any> = {};
  for (const f of fields) if (f in data) out[f] = data[f];
  return out;
}

export function refreshSite() {
  try {
    revalidatePath("/", "layout");
  } catch {
    /* noop outside of a request */
  }
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
