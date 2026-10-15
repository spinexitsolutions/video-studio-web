import { z } from "zod";
import { createDoc, listDocs } from "@/lib/db";
import { bad, json } from "@/lib/api";
import { verifyCaptcha } from "@/lib/captcha";
import { webhook } from "@/lib/mailer";
import { clientIp } from "@/lib/url";

export async function POST(req: Request) {
  const parsed = z.object({ email: z.string().trim().toLowerCase().email(), captcha: z.string().optional() }).safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return bad("Please enter a valid email");
  if (!(await verifyCaptcha(parsed.data.captcha, clientIp(req)))) return bad("Captcha check failed — please try again.");
  const { email } = parsed.data;
  if (!listDocs("subscribers").some((s) => s.email === email)) {
    await createDoc("subscribers", { email });
    webhook("subscriber.created", { email });
  }
  return json({ ok: true });
}
