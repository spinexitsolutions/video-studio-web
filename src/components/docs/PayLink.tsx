"use client";

import { useState } from "react";
import { Check, CreditCard, Loader2 } from "lucide-react";
import { payWithRazorpay } from "@/components/site/razorpay";

export default function PayLink({ token, label, paid: initiallyPaid }: { token: string; label: string; paid: boolean }) {
  const [paid, setPaid] = useState(initiallyPaid);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (paid)
    return (
      <p className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-5 py-3 text-emerald-500">
        <Check className="h-4 w-4" /> Paid — thank you!
      </p>
    );
  return (
    <div>
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const r = await fetch(`/api/pay/${token}`);
            const d = await r.json();
            if (d.paid) setPaid(true);
            else if (await payWithRazorpay(d.checkout)) setPaid(true);
          } catch (e: any) {
            setError(e.message || "Payment failed");
          }
          setBusy(false);
        }}
        className="btn-accent"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />} Pay {label}
      </button>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </div>
  );
}
