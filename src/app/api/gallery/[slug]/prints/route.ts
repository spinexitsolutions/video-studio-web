import { z } from "zod";
import { createDoc, listDocs } from "@/lib/db";
import { bad, json } from "@/lib/api";
import { accessibleGallery } from "@/lib/gallery";
import { razorpayReady } from "@/lib/integrations";
import { createPayment } from "@/lib/payments";
import { checkoutOptions } from "@/lib/checkout";
import { notifyStudio, sendTemplate, webhook } from "@/lib/mailer";
import { formatMoney } from "@/lib/money";
import type { PrintOrder, PrintProduct } from "@/lib/types";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().min(6, "Please enter a phone number").max(40),
  address: z.string().trim().min(8, "Please enter a shipping address").max(500),
  items: z.array(z.object({ image: z.string(), productId: z.string(), qty: z.number().int().min(1).max(50) })).min(1, "Your cart is empty").max(100),
});

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { gallery } = await accessibleGallery(slug);
  if (!gallery) return bad("Gallery locked", 401);
  if (!gallery.allowPrints) return bad("Print ordering is turned off for this gallery", 403);
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return bad(parsed.error.issues[0]?.message || "Invalid order");
  const products = listDocs<PrintProduct>("printProducts", { published: true });
  const items = [];
  for (const it of parsed.data.items) {
    const p = products.find((x) => x.id === it.productId);
    if (!p || !gallery.images.includes(it.image)) return bad("An item in your cart is no longer available");
    items.push({ image: it.image, productId: p.id, product: `${p.name} · ${p.size}`, qty: it.qty, price: p.price });
  }
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const { name, email, phone, address } = parsed.data;
  const order = await createDoc<PrintOrder>("printOrders", { galleryId: gallery.id, galleryTitle: gallery.title, name, email, phone, address, items, total, status: "pending", paymentStatus: "unpaid", notes: "" });

  let checkout = null;
  if (razorpayReady()) {
    try {
      const p = await createPayment({ purpose: "print", refId: order.id, description: `Print order — ${items.length} item(s)`, amount: total, customerName: name, customerEmail: email, customerPhone: phone });
      checkout = checkoutOptions(p);
    } catch (e: any) {
      console.error("[prints] payment failed:", e?.message);
    }
  }
  const vars = { name, count: items.reduce((s, i) => s + i.qty, 0), amount: formatMoney(total) };
  sendTemplate("printOrderClient", email, vars);
  notifyStudio("printOrderClient", { ...vars, name: `${name} (${email}, ${phone}) — gallery ${gallery.title}` });
  webhook("print_order.created", { id: order.id, gallery: gallery.title, name, email, total });
  return json({ ok: true, id: order.id, total, checkout }, 201);
}
