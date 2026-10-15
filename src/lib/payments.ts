import crypto from "node:crypto";
import { createDoc, findDoc, getDoc, newId, updateDoc } from "./db";
import { integrations, razorpayReady } from "./integrations";
import { formatMoney } from "./money";
import { notifyStudio, sendTemplate, webhook } from "./mailer";
import type { Booking, Invoice, Payment, PrintOrder } from "./types";

const API = "https://api.razorpay.com/v1";

async function razorpayOrder(amount: number, currency: string, receipt: string, notes: Record<string, string>) {
  const i = integrations();
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${i.razorpayKeyId}:${i.razorpayKeySecret}`).toString("base64"),
    },
    body: JSON.stringify({ amount: Math.round(amount * 100), currency, receipt: receipt.slice(0, 40), notes }),
  });
  const data = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) throw new Error(data?.error?.description || `Razorpay error (${res.status})`);
  return data as { id: string; amount: number; currency: string };
}

export interface CreatePaymentInput {
  purpose: Payment["purpose"];
  refId: string;
  description: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

/** Creates (or reuses) a pending payment + Razorpay order. */
export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  if (!razorpayReady()) throw new Error("Online payments are not set up yet.");
  if (!(input.amount > 0)) throw new Error("Nothing to pay.");
  const currency = integrations().currency || "INR";
  const token = newId();
  const order = await razorpayOrder(input.amount, currency, `${input.purpose}_${input.refId}`, { purpose: input.purpose, refId: input.refId });
  return createDoc<Payment>("payments", {
    ...input,
    customerPhone: input.customerPhone || "",
    token,
    currency,
    provider: "razorpay",
    providerOrderId: order.id,
    providerPaymentId: "",
    status: "created",
    paidAt: "",
  });
}

export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string) {
  const expected = crypto.createHmac("sha256", integrations().razorpayKeySecret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = integrations().razorpayWebhookSecret;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a || "");
  const y = Buffer.from(b || "");
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** Marks a payment paid (idempotent) and updates whatever it was for. */
export async function markPaid(orderId: string, paymentId: string) {
  const p = findDoc<Payment>("payments", "providerOrderId", orderId);
  if (!p) return null;
  if (p.status === "paid") return p;
  const paid = (await updateDoc<Payment>("payments", p.id, { status: "paid", providerPaymentId: paymentId, paidAt: new Date().toISOString() }))!;

  if (p.purpose === "booking") {
    const b = getDoc<Booking>("bookings", p.refId);
    if (b) await updateDoc("bookings", b.id, { paymentStatus: "deposit_paid", status: b.status === "new" ? "confirmed" : b.status });
  } else if (p.purpose === "invoice") {
    const inv = getDoc<Invoice>("invoices", p.refId);
    if (inv) await updateDoc("invoices", inv.id, { status: "paid", paidAt: paid.paidAt });
  } else if (p.purpose === "print") {
    const o = getDoc<PrintOrder>("printOrders", p.refId);
    if (o) await updateDoc("printOrders", o.id, { paymentStatus: "paid", status: o.status === "pending" ? "paid" : o.status });
  }

  const amount = formatMoney(p.amount, p.currency);
  sendTemplate("paymentClient", p.customerEmail, { name: p.customerName, amount, description: p.description, paymentId });
  notifyStudio("paymentClient", { name: p.customerName, amount, description: `${p.description} (from ${p.customerName}, ${p.customerEmail})`, paymentId });
  webhook("payment.paid", { purpose: p.purpose, refId: p.refId, amount: p.amount, currency: p.currency, customer: p.customerEmail, paymentId });
  return paid;
}
