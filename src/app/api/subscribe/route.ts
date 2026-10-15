import { z } from "zod";
import { createDoc, listDocs } from "@/lib/db";
import { bad, json } from "@/lib/api";

export async function POST(req: Request) {
  const parsed = z.object({ email: z.string().trim().toLowerCase().email() }).safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return bad("Please enter a valid email");
  const { email } = parsed.data;
  if (!listDocs("subscribers").some((s) => s.email === email)) await createDoc("subscribers", { email });
  return json({ ok: true });
}
