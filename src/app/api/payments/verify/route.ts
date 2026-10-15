import { z } from "zod";
import { bad, json } from "@/lib/api";
import { markPaid, verifyCheckoutSignature } from "@/lib/payments";

const schema = z.object({ razorpay_order_id: z.string().min(4), razorpay_payment_id: z.string().min(4), razorpay_signature: z.string().min(10) });

/** Called by the browser after Razorpay Checkout succeeds. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return bad("Invalid payment response");
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
  if (!verifyCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) return bad("Payment signature mismatch", 400);
  const p = await markPaid(razorpay_order_id, razorpay_payment_id);
  return p ? json({ ok: true }) : bad("Payment not found", 404);
}
