import { z } from "zod";
import { createDoc, getSingleton } from "@/lib/db";
import { bad, json } from "@/lib/api";

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
  date: z.string().trim().max(40).optional().default(""),
  location: z.string().trim().max(200).optional().default(""),
  budget: z.string().trim().max(60).optional().default(""),
  message: z.string().trim().max(5000).optional().default(""),
  website: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  if (!getSingleton("settings").bookingEnabled) return bad("Online booking is currently closed.", 403);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return bad("Too many requests — please try again later.", 429);
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return bad(parsed.error.issues[0]?.message || "Invalid data");
  const { website, ...data } = parsed.data;
  if (website) return json({ ok: true }); // bot
  await createDoc("bookings", { ...data, status: "new", notes: "" });
  return json({ ok: true }, 201);
}
