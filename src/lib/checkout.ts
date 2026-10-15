import { getSingleton } from "./db";
import { integrations } from "./integrations";
import type { Payment } from "./types";

/** Options for Razorpay Checkout in the browser — contains only the public key id. */
export function checkoutOptions(p: Payment) {
  const s = getSingleton("settings");
  const t = getSingleton("theme");
  return {
    key: integrations().razorpayKeyId,
    order_id: p.providerOrderId,
    amount: Math.round(p.amount * 100),
    currency: p.currency,
    name: s.siteName,
    description: p.description,
    prefill: { name: p.customerName, email: p.customerEmail, contact: p.customerPhone },
    theme: { color: t.accent },
    token: p.token,
  };
}
export type CheckoutOptions = ReturnType<typeof checkoutOptions>;
