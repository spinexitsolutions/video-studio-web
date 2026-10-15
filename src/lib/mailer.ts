import nodemailer from "nodemailer";
import { marked } from "marked";
import { getSingleton } from "./db";
import { integrations, smtpReady } from "./integrations";
import type { EmailTemplates } from "./types";

type Vars = Record<string, string | number | undefined | null>;

export function fill(tpl: string, vars: Vars) {
  return (tpl || "").replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (vars[k] === undefined || vars[k] === null ? "" : String(vars[k])));
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function layout(bodyMd: string, footer: string) {
  const s = getSingleton("settings");
  const t = getSingleton("theme");
  const body = marked.parse(bodyMd, { async: false }) as string;
  return `<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden">
<tr><td style="background:#0b0b0d;padding:22px 32px;color:#fff;font-weight:600;letter-spacing:.18em;font-size:15px">
<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${t.accent};margin-right:10px"></span>${esc(s.logoText)}</td></tr>
<tr><td style="padding:32px;font-size:15px;line-height:1.65">${body.replace(/<a /g, `<a style="color:${t.accent};font-weight:600" `)}</td></tr>
<tr><td style="padding:18px 32px;border-top:1px solid #eee;font-size:12px;color:#71717a">${esc(footer)}</td></tr>
</table></td></tr></table></body></html>`;
}

function transport() {
  const i = integrations();
  return nodemailer.createTransport({
    host: i.smtpHost,
    port: Number(i.smtpPort) || 587,
    secure: !!i.smtpSecure,
    auth: i.smtpUser ? { user: i.smtpUser, pass: i.smtpPass } : undefined,
  });
}

export async function sendMail(to: string, subject: string, markdown: string): Promise<{ ok: boolean; error?: string }> {
  const i = integrations();
  if (!smtpReady(i) || !to) return { ok: false, error: "SMTP is not configured" };
  const s = getSingleton("settings");
  const tpl = getSingleton("emails");
  const footer = fill(tpl.footer, { studio: s.siteName, email: s.email, phone: s.phone });
  try {
    await transport().sendMail({
      from: `"${i.smtpFromName || s.siteName}" <${i.smtpFromEmail || i.smtpUser}>`,
      to,
      replyTo: s.email || undefined,
      subject,
      text: markdown.replace(/\*\*|__|\[([^\]]+)\]\(([^)]+)\)/g, (m, a, b) => (a ? `${a}: ${b}` : "")),
      html: layout(markdown, footer),
    });
    return { ok: true };
  } catch (e: any) {
    console.error("[mail] failed:", e?.message);
    return { ok: false, error: e?.message || "Send failed" };
  }
}

type TemplateKey = "bookingClient" | "bookingAdmin" | "paymentClient" | "galleryClient" | "selectionAdmin" | "printOrderClient" | "invoiceClient" | "contractClient" | "contractSignedAdmin";

/** Send one of the admin-editable templates. Common studio variables are filled in automatically. */
export async function sendTemplate(key: TemplateKey, to: string, vars: Vars) {
  const t = getSingleton("emails") as EmailTemplates;
  const s = getSingleton("settings");
  const all = { studio: s.siteName, email: s.email, phone: s.phone, ...vars };
  return sendMail(to, fill((t as any)[`${key}Subject`], all), fill((t as any)[`${key}Body`], all));
}

/** Email the studio (notify address) — used for every new booking, payment, selection, signature… */
export async function notifyStudio(key: TemplateKey, vars: Vars) {
  const i = integrations();
  const s = getSingleton("settings");
  return sendTemplate(key, i.notifyEmail || s.email, vars);
}

/** Fire-and-forget JSON webhook (Zapier / Make / n8n → WhatsApp, Slack, Sheets…). */
export function webhook(event: string, data: Record<string, any>) {
  const url = integrations().webhookUrl;
  if (!url) return;
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event, at: new Date().toISOString(), data }) }).catch((e) =>
    console.error("[webhook] failed:", e?.message)
  );
}
