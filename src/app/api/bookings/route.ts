import { z } from "zod";
import { createDoc, getSingleton, listDocs, updateDoc } from "@/lib/db";
import { bad, json } from "@/lib/api";
import { verifyCaptcha } from "@/lib/captcha";
import { isDateAvailable } from "@/lib/availability";
import { razorpayReady } from "@/lib/integrations";
import { createPayment } from "@/lib/payments";
import { checkoutOptions } from "@/lib/checkout";
import { notifyStudio, sendTemplate, webhook } from "@/lib/mailer";
import { formatMoney } from "@/lib/money";
import { baseUrl, clientIp } from "@/lib/url";
import type { Booking, Package } from "@/lib/types";

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60 * 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 10;
}

const schema = z.object({
  name: z.string().trim().min(2, "Please tell us your name").max(120),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().max(40).optional().default(""),
  service: z.string().trim().max(120).optional().default(""),
  package: z.string().trim().max(120).optional().default(""),
  date: z
    .string()
    .trim()
    .max(10)
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Invalid date")
    .optional()
    .default(""),
  location: z.string().trim().max(200).optional().default(""),
  budget: z.string().trim().max(60).optional().default(""),
  message: z.string().trim().max(5000).optional().default(""),
  website: z.string().optional(), // honeypot
  captcha: z.string().optional(),
  payDeposit: z.boolean().optional(),
});

export async function POST(req: Request) {
  if (!getSingleton("settings").bookingEnabled) return bad("Online booking is currently closed.", 403);
  const ip = clientIp(req);
  if (limited(ip)) return bad("Too many requests — please try again later.", 429);
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return bad(parsed.error.issues[0]?.message || "Invalid data");
  const { website, captcha, payDeposit, ...data } = parsed.data;
  if (website) return json({ ok: true }); // bot
  if (!(await verifyCaptcha(captcha, ip))) return bad("Please complete the captcha and try again.");
  if (data.date && !isDateAvailable(data.date)) return bad("Sorry — that date is no longer available. Please pick another one.", 409);

  // deposit
  const cfg = getSingleton("booking");
  const pkg = listDocs<Package>("packages").find((p) => p.name === data.package);
  let deposit = 0;
  if (cfg.depositEnabled && razorpayReady()) {
    deposit = cfg.depositType === "percent" && pkg?.amount ? Math.round((pkg.amount * (Number(cfg.depositPercent) || 0)) / 100) : Number(cfg.depositFixed) || 0;
  }

  const booking = await createDoc<Booking>("bookings", { ...data, status: "new", notes: "", paymentStatus: deposit > 0 ? "pending" : "none", depositAmount: deposit });

  let checkout = null;
  if (deposit > 0 && (payDeposit || cfg.requireDeposit)) {
    try {
      const p = await createPayment({
        purpose: "booking",
        refId: booking.id,
        description: `Booking deposit — ${data.service || "Session"}${data.date ? ` on ${data.date}` : ""}`,
        amount: deposit,
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
      });
      await updateDoc("bookings", booking.id, { paymentToken: p.token });
      checkout = checkoutOptions(p);
    } catch (e: any) {
      console.error("[booking] deposit order failed:", e?.message);
    }
  }

  const base = await baseUrl();
  const vars = {
    name: data.name,
    email_client: data.email,
    phone_client: data.phone || "—",
    service: data.service || "a session",
    package: data.package || "—",
    date: data.date || "a date to be confirmed",
    location: data.location || "—",
    budget: data.budget || "—",
    message: data.message || "—",
    adminUrl: `${base}/admin/bookings?id=${booking.id}`,
    paymentLine: deposit > 0 ? `To secure your date, a deposit of **${formatMoney(deposit)}** is due.` : "",
  };
  sendTemplate("bookingClient", data.email, vars);
  notifyStudio("bookingAdmin", vars);
  webhook("booking.created", { id: booking.id, ...data, deposit });

  return json({ ok: true, id: booking.id, deposit, checkout }, 201);
}
