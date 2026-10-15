"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, CreditCard, Loader2, Printer, X } from "lucide-react";
import { payWithRazorpay } from "@/components/site/razorpay";

export default function InvoiceActions({ token, kind, status, canPay, amountLabel }: { token: string; kind: string; status: string; canPay: boolean; amountLabel: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string>("");
  const [msg, setMsg] = useState("");

  const respond = async (decision: "accepted" | "declined") => {
    setBusy(decision);
    const r = await fetch(`/api/invoice/${token}/respond`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision }) });
    setBusy("");
    setMsg(r.ok ? (decision === "accepted" ? "Thank you! The studio has been notified." : "Noted — the studio has been notified.") : "Something went wrong");
    router.refresh();
  };
  const pay = async () => {
    setBusy("pay");
    setMsg("");
    try {
      const r = await fetch(`/api/invoice/${token}/pay`, { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      if (await payWithRazorpay(d.checkout)) {
        setMsg("Payment received — thank you!");
        router.refresh();
      }
    } catch (e: any) {
      setMsg(e.message || "Payment failed");
    }
    setBusy("");
  };

  return (
    <div className="no-print flex flex-wrap items-center gap-3">
      {kind === "quote" && status === "sent" && (
        <>
          <button onClick={() => respond("accepted")} disabled={!!busy} className="btn-accent">
            {busy === "accepted" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Accept quotation
          </button>
          <button onClick={() => respond("declined")} disabled={!!busy} className="btn-ghost">
            <X className="h-4 w-4" /> Decline
          </button>
        </>
      )}
      {canPay && status !== "paid" && status !== "declined" && (
        <button onClick={pay} disabled={!!busy} className="btn-accent">
          {busy === "pay" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />} Pay {amountLabel}
        </button>
      )}
      <button onClick={() => window.print()} className="btn-ghost">
        <Printer className="h-4 w-4" /> Print / Save PDF
      </button>
      {msg && <p className="w-full text-sm text-muted">{msg}</p>}
    </div>
  );
}
