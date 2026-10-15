import { findDoc } from "@/lib/db";
import { bad, json } from "@/lib/api";
import { checkoutOptions } from "@/lib/checkout";
import type { Payment } from "@/lib/types";

/** Checkout options for an existing pending payment (the "pay later" link). */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const p = findDoc<Payment>("payments", "token", token);
  if (!p) return bad("Payment link not found", 404);
  if (p.status === "paid") return json({ paid: true });
  return json({ paid: false, checkout: checkoutOptions(p) });
}
