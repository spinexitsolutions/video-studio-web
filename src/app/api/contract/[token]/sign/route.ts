import { z } from "zod";
import { findDoc, updateDoc } from "@/lib/db";
import { bad, json } from "@/lib/api";
import { verifyCaptcha } from "@/lib/captcha";
import { notifyStudio, webhook } from "@/lib/mailer";
import { baseUrl, clientIp } from "@/lib/url";
import type { Contract } from "@/lib/types";

const schema = z.object({
  name: z.string().trim().min(2, "Please type your full name").max(120),
  signature: z
    .string()
    .startsWith("data:image/png;base64,", "Please draw your signature")
    .max(400_000, "Signature image is too large"),
  agree: z.literal(true, { errorMap: () => ({ message: "Please confirm you agree to the terms" }) }),
  captcha: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const c = findDoc<Contract>("contracts", "token", token);
  if (!c) return bad("Not found", 404);
  if (c.status === "signed") return bad("This contract has already been signed.");
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return bad(parsed.error.issues[0]?.message || "Invalid signature");
  const ip = clientIp(req);
  if (!(await verifyCaptcha(parsed.data.captcha, ip))) return bad("Captcha check failed — please try again.");
  const signedAt = new Date().toISOString();
  await updateDoc("contracts", c.id, { status: "signed", signedName: parsed.data.name, signature: parsed.data.signature, signedAt, signedIp: ip });
  notifyStudio("contractSignedAdmin", { name: parsed.data.name, title: c.title, signedAt: new Date(signedAt).toLocaleString(), adminUrl: `${await baseUrl()}/admin/content/contracts/${c.id}` });
  webhook("contract.signed", { title: c.title, client: parsed.data.name, signedAt });
  return json({ ok: true, signedAt });
}
