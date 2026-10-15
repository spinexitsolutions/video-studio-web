import bcrypt from "bcryptjs";
import { z } from "zod";
import { getDoc, updateDoc } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bad, json } from "@/lib/api";
import type { User } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1).max(100),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "New password must be at least 8 characters").optional().or(z.literal("")),
});

export async function PUT(req: Request) {
  const [me, err] = await requireUser();
  if (err) return err;
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return bad(parsed.error.issues[0]?.message || "Invalid data");
  const user = getDoc<User>("users", me.sub)!;
  const data: Record<string, any> = { name: parsed.data.name };
  if (parsed.data.newPassword) {
    const ok = await bcrypt.compare(parsed.data.currentPassword || "", user.passwordHash);
    if (!ok) return bad("Current password is incorrect", 401);
    data.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  }
  await updateDoc("users", me.sub, data);
  return json({ ok: true });
}
