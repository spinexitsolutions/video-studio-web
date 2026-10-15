"use client";

import type { CheckoutOptions } from "@/lib/checkout";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function load(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load the payment window. Check your connection."));
    document.body.appendChild(s);
  });
}

/** Opens Razorpay Checkout and verifies the result on the server. Resolves true when paid. */
export async function payWithRazorpay(opts: CheckoutOptions): Promise<boolean> {
  await load();
  return new Promise((resolve, reject) => {
    const rz = new window.Razorpay({
      key: opts.key,
      order_id: opts.order_id,
      amount: opts.amount,
      currency: opts.currency,
      name: opts.name,
      description: opts.description,
      prefill: opts.prefill,
      theme: opts.theme,
      handler: async (resp: any) => {
        const r = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resp) });
        if (r.ok) resolve(true);
        else reject(new Error((await r.json().catch(() => ({}))).error || "Payment verification failed"));
      },
      modal: { ondismiss: () => resolve(false) },
    });
    rz.on("payment.failed", (e: any) => reject(new Error(e?.error?.description || "Payment failed")));
    rz.open();
  });
}
