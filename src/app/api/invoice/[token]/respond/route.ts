import { findDoc, updateDoc } from "@/lib/db";
import { bad, json } from "@/lib/api";
import { notifyStudio, webhook } from "@/lib/mailer";
import type { Invoice } from "@/lib/types";

/** Client accepts or declines a quotation. */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = findDoc<Invoice>("invoices", "token", token);
  if (!inv || inv.kind !== "quote") return bad("Not found", 404);
  const { decision } = await req.json().catch(() => ({}));
  if (decision !== "accepted" && decision !== "declined") return bad("Invalid decision");
  if (inv.status === "paid") return bad("Already paid");
  await updateDoc("invoices", inv.id, { status: decision });
  notifyStudio("contractSignedAdmin", { name: inv.clientName, title: `Quotation ${inv.number} — ${decision.toUpperCase()}`, signedAt: new Date().toLocaleString(), adminUrl: "" });
  webhook(`quote.${decision}`, { number: inv.number, client: inv.clientName });
  return json({ ok: true, status: decision });
}
