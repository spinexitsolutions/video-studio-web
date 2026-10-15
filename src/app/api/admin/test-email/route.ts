import { requireUser } from "@/lib/auth";
import { bad, json } from "@/lib/api";
import { sendMail } from "@/lib/mailer";

export async function POST(req: Request) {
  const [me, err] = await requireUser("admin");
  if (err) return err;
  const { to } = await req.json().catch(() => ({}));
  const r = await sendMail(to || me.email, "✅ Test email from your studio website", "This is a test email.\n\nIf you're reading this, **SMTP is set up correctly** and booking alerts & client emails will be delivered.");
  return r.ok ? json({ ok: true }) : bad(r.error || "Send failed", 502);
}
