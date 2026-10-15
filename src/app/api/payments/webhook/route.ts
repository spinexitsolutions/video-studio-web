import { bad, json } from "@/lib/api";
import { markPaid, verifyWebhookSignature } from "@/lib/payments";

/** Razorpay webhook (payment.captured / order.paid) — a safety net if the browser closes mid-payment. */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature") || "")) return bad("Invalid signature", 401);
  const evt = JSON.parse(raw);
  const payment = evt?.payload?.payment?.entity;
  if ((evt.event === "payment.captured" || evt.event === "order.paid") && payment?.order_id) await markPaid(payment.order_id, payment.id);
  return json({ ok: true });
}
