import { findDoc, listDocs } from "@/lib/db";
import { bad, json } from "@/lib/api";
import { createPayment } from "@/lib/payments";
import { checkoutOptions } from "@/lib/checkout";
import { invoiceTotals } from "@/lib/money";
import type { Invoice, Payment } from "@/lib/types";

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = findDoc<Invoice>("invoices", "token", token);
  if (!inv) return bad("Not found", 404);
  if (inv.status === "paid") return bad("This invoice is already paid.");
  const { total } = invoiceTotals(inv);
  // reuse a pending order for the same amount instead of creating duplicates
  const existing = listDocs<Payment>("payments").find((p) => p.purpose === "invoice" && p.refId === inv.id && p.status === "created" && p.amount === total);
  try {
    const p =
      existing ||
      (await createPayment({ purpose: "invoice", refId: inv.id, description: `${inv.kind === "quote" ? "Quotation" : "Invoice"} ${inv.number}`, amount: total, customerName: inv.clientName, customerEmail: inv.clientEmail, customerPhone: inv.clientPhone }));
    return json({ checkout: checkoutOptions(p) });
  } catch (e: any) {
    return bad(e.message || "Payment unavailable", 503);
  }
}
