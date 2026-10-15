import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findDoc, getSingleton } from "@/lib/db";
import { formatMoney, invoiceTotals } from "@/lib/money";
import { publicIntegrations } from "@/lib/integrations";
import { formatDate } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import type { Invoice } from "@/lib/types";
import InvoiceActions from "@/components/docs/InvoiceActions";

export const metadata: Metadata = { title: "Invoice", robots: { index: false, follow: false } };

export default async function InvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = findDoc<Invoice>("invoices", "token", token);
  if (!inv || inv.status === "draft") notFound();
  const s = getSingleton("settings");
  const cfg = publicIntegrations();
  const t = invoiceTotals(inv);
  const money = (n: number) => formatMoney(n, cfg.currency);
  const label = inv.kind === "quote" ? "Quotation" : "Invoice";
  const canPay = cfg.razorpay && (inv.kind === "invoice" || inv.status === "accepted");

  return (
    <section className="container-x max-w-4xl pb-24 pt-32 sm:pt-40">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow">{label}</span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {inv.number} · {money(t.total)}
          </h1>
        </div>
        <InvoiceActions token={inv.token} kind={inv.kind} status={inv.status} canPay={canPay} amountLabel={money(t.total)} />
      </div>

      <article className="relative overflow-hidden rounded-[calc(24px*var(--rs))] bg-white p-8 text-zinc-900 shadow-2xl sm:p-12 print:rounded-none print:p-0 print:shadow-none">
        {(inv.status === "paid" || inv.status === "accepted" || inv.status === "declined") && (
          <span
            className={`absolute right-10 top-52 rotate-12 rounded-lg border-4 opacity-80 px-4 py-1 text-2xl font-black uppercase tracking-widest ${
              inv.status === "declined" ? "border-red-500 text-red-500" : "border-emerald-600 text-emerald-600"
            }`}
          >
            {inv.status}
          </span>
        )}
        <header className="flex flex-wrap justify-between gap-8 border-b border-zinc-200 pb-8">
          <div>
            <p className="text-xl font-bold tracking-[0.18em]">{s.logoText}</p>
            <p className="mt-2 text-sm text-zinc-500">
              {s.siteName}
              <br />
              {s.address}, {s.city}
              <br />
              {s.email} · {s.phone}
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="text-2xl font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
            <p className="mt-2">
              <span className="text-zinc-500">No.</span> {inv.number}
            </p>
            <p>
              <span className="text-zinc-500">Date</span> {formatDate(inv.issueDate)}
            </p>
            {inv.dueDate && (
              <p>
                <span className="text-zinc-500">{inv.kind === "quote" ? "Valid until" : "Due"}</span> {formatDate(inv.dueDate)}
              </p>
            )}
          </div>
        </header>
        <div className="py-8 text-sm">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Billed to</p>
          <p className="mt-1 text-base font-medium">{inv.clientName}</p>
          <p className="text-zinc-500">
            {[inv.clientEmail, inv.clientPhone].filter(Boolean).join(" · ")}
            {inv.clientAddress && (
              <>
                <br />
                {inv.clientAddress}
              </>
            )}
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wider text-zinc-400">
              <th className="py-3 font-medium">Description</th>
              <th className="py-3 text-right font-medium">Qty</th>
              <th className="py-3 text-right font-medium">Rate</th>
              <th className="py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(inv.items || []).map((it, i) => (
              <tr key={i} className="border-b border-zinc-100">
                <td className="py-3.5 pr-4">{it.description}</td>
                <td className="py-3.5 text-right tabular-nums">{it.qty}</td>
                <td className="py-3.5 text-right tabular-nums">{money(it.rate)}</td>
                <td className="py-3.5 text-right tabular-nums">{money(it.qty * it.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ml-auto mt-6 w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Subtotal</span>
            <span className="tabular-nums">{money(t.subtotal)}</span>
          </div>
          {t.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Discount</span>
              <span className="tabular-nums">− {money(t.discount)}</span>
            </div>
          )}
          {inv.taxPercent > 0 && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Tax ({inv.taxPercent}%)</span>
              <span className="tabular-nums">{money(t.tax)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-zinc-200 pt-3 text-lg font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{money(t.total)}</span>
          </div>
        </div>
        {inv.notes && <div className="mt-10 border-t border-zinc-200 pt-6 text-sm text-zinc-600 [&_a]:underline [&_p]:my-1" dangerouslySetInnerHTML={{ __html: renderMarkdown(inv.notes) }} />}
      </article>
    </section>
  );
}
