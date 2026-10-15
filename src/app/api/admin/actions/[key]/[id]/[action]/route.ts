import { getDoc, updateDoc } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bad, json } from "@/lib/api";
import { sendTemplate } from "@/lib/mailer";
import { baseUrl } from "@/lib/url";
import { formatMoney, invoiceTotals } from "@/lib/money";
import { integrations, smtpReady } from "@/lib/integrations";
import type { Contract, Gallery, Invoice } from "@/lib/types";

type Ctx = { params: Promise<{ key: string; id: string; action: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const [, err] = await requireUser();
  if (err) return err;
  const { key, id, action } = await params;
  if (action !== "send") return bad("Unknown action", 404);
  if (!smtpReady()) return bad("Set up SMTP email in Integrations first — or copy the link and share it on WhatsApp.");
  const base = await baseUrl();

  if (key === "galleries") {
    const g = getDoc<Gallery>("galleries", id);
    if (!g) return bad("Not found", 404);
    if (!g.clientEmail) return bad("Add the client's email first");
    const r = await sendTemplate("galleryClient", g.clientEmail, { name: g.clientName, gallery: g.title, link: `${base}/gallery/${g.slug}`, code: g.accessCode });
    return r.ok ? json({ ok: true, message: `Sent to ${g.clientEmail}` }) : bad(r.error || "Send failed", 502);
  }
  if (key === "invoices") {
    const inv = getDoc<Invoice>("invoices", id);
    if (!inv) return bad("Not found", 404);
    if (!inv.clientEmail) return bad("Add the client's email first");
    const { total } = invoiceTotals(inv);
    const r = await sendTemplate("invoiceClient", inv.clientEmail, {
      name: inv.clientName,
      kind: inv.kind === "quote" ? "Quotation" : "Invoice",
      number: inv.number,
      amount: formatMoney(total, integrations().currency),
      link: `${base}/invoice/${inv.token}`,
    });
    if (r.ok && inv.status === "draft") await updateDoc("invoices", id, { status: "sent" });
    return r.ok ? json({ ok: true, message: `Sent to ${inv.clientEmail}` }) : bad(r.error || "Send failed", 502);
  }
  if (key === "contracts") {
    const c = getDoc<Contract>("contracts", id);
    if (!c) return bad("Not found", 404);
    if (!c.clientEmail) return bad("Add the client's email first");
    const r = await sendTemplate("contractClient", c.clientEmail, { name: c.clientName, title: c.title, link: `${base}/contract/${c.token}` });
    if (r.ok && c.status === "draft") await updateDoc("contracts", id, { status: "sent" });
    return r.ok ? json({ ok: true, message: `Sent to ${c.clientEmail}` }) : bad(r.error || "Send failed", 502);
  }
  return bad("Unknown action", 404);
}
