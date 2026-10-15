import bcrypt from "bcryptjs";
import { z } from "zod";
import { deleteDoc, getDoc, listDocs, updateDoc } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bad, json } from "@/lib/api";
import type { User } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  role: z.enum(["admin", "editor"]).optional(),
});

export async function PUT(req: Request, { params }: Ctx) {
  const [me, err] = await requireUser("admin");
  if (err) return err;
  const { id } = await params;
  const user = getDoc<User>("users", id);
  if (!user) return bad("Not found", 404);
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return bad(parsed.error.issues[0]?.message || "Invalid data");
  const { password, ...rest } = parsed.data;
  if (rest.email && listDocs<User>("users").some((u) => u.id !== id && u.email.toLowerCase() === rest.email!.toLowerCase())) {
    return bad("Email already in use", 409);
  }
  if (rest.role === "editor" && user.role === "admin" && listDocs<User>("users").filter((u) => u.role === "admin").length <= 1) {
    return bad("There must be at least one admin");
  }
  if (me.sub === id && rest.role === "editor") return bad("You can't demote yourself");
  const data: Record<string, any> = { ...rest };
  if (rest.email) data.email = rest.email.toLowerCase();
  if (password) data.passwordHash = await bcrypt.hash(password, 10);
  const updated = await updateDoc<User>("users", id, data);
  const { passwordHash: _p, ...safe } = updated!;
  return json(safe);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const [me, err] = await requireUser("admin");
  if (err) return err;
  const { id } = await params;
  if (me.sub === id) return bad("You can't delete your own account");
  const user = getDoc<User>("users", id);
  if (!user) return bad("Not found", 404);
  if (user.role === "admin" && listDocs<User>("users").filter((u) => u.role === "admin").length <= 1) return bad("There must be at least one admin");
  await deleteDoc("users", id);
  return json({ ok: true });
}
