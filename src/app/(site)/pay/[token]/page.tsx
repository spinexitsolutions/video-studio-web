import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { findDoc } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import type { Payment } from "@/lib/types";
import PayLink from "@/components/docs/PayLink";

export const metadata: Metadata = { title: "Secure payment", robots: { index: false, follow: false } };

export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const p = findDoc<Payment>("payments", "token", token);
  if (!p) notFound();
  return (
    <section className="container-x flex min-h-[80svh] items-center justify-center pb-20 pt-32">
      <div className="card w-full max-w-md p-8 text-center sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-on-accent">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <p className="mt-6 text-sm text-muted">{p.description}</p>
        <p className="mt-2 text-5xl font-semibold tracking-tight">{formatMoney(p.amount, p.currency)}</p>
        <p className="mt-2 text-sm text-muted">For {p.customerName}</p>
        <div className="mt-8">
          <PayLink token={p.token} label={formatMoney(p.amount, p.currency)} paid={p.status === "paid"} />
        </div>
        <p className="mt-6 text-xs text-muted">Secure checkout by Razorpay · UPI · Cards · Netbanking · Wallets</p>
      </div>
    </section>
  );
}
