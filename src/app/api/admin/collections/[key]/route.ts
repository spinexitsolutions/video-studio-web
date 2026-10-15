import { createDoc, listDocs } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bad, isKnownCollection, json, pick, refreshSite, slugify, writableFields } from "@/lib/api";
import { newId } from "@/lib/db";
import type { CollectionKey } from "@/lib/types";

type Ctx = { params: Promise<{ key: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const [, err] = await requireUser();
  if (err) return err;
  const { key } = await params;
  if (!isKnownCollection(key)) return bad("Unknown collection", 404);
  return json(listDocs(key as CollectionKey, { sort: ["bookings", "subscribers", "payments", "printOrders", "invoices", "contracts"].includes(key) ? "newest" : "order" }));
}

export async function POST(req: Request, { params }: Ctx) {
  const [, err] = await requireUser();
  if (err) return err;
  const { key } = await params;
  const fields = writableFields(key);
  if (!fields) return bad("Unknown collection", 404);
  if (!fields.length) return bad("This list is read-only", 403);
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return bad("Invalid body");
  const data = pick(body, fields);
  if ("slug" in data || fields.includes("slug")) {
    data.slug = slugify(data.slug || data.title || data.name || "item");
    const existing = listDocs(key as CollectionKey);
    let slug = data.slug, i = 2;
    while (existing.some((d) => d.slug === slug)) slug = `${data.slug}-${i++}`;
    data.slug = slug;
  }
  if (key === "bookings" && !data.status) data.status = "new";
  if (key === "invoices" || key === "contracts") data.token = newId();
  if (key === "invoices" && !data.number) {
    const prefix = data.kind === "quote" ? "Q" : "INV";
    const year = new Date().getFullYear();
    const n = listDocs(key).filter((d) => String(d.number || "").startsWith(`${prefix}-${year}`)).length + 1;
    data.number = `${prefix}-${year}-${String(n).padStart(3, "0")}`;
  }
  if (key === "galleries") data.favorites = [];
  const doc = await createDoc(key as CollectionKey, data);
  refreshSite();
  return json(doc, 201);
}
