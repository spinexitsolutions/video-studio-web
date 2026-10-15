import bcrypt from "bcryptjs";
import { z } from "zod";
import { createDoc, listDocs } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bad, json } from "@/lib/api";
import type { User } from "@/lib/types";

const strip = ({ passwordHash: _p, ...u }: User) => u;

export async function GET() {
  const [, err] = await requireUser();
  if (err) return err;
  return json(listDocs<User>("users").map(strip));
}

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "editor"]),
});

export async function POST(req: Request) {
  const [, err] = await requireUser("admin");
  if (err) return err;
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return bad(parsed.error.issues[0]?.message || "Invalid data");
  const { name, email, password, role } = parsed.data;
  if (listDocs<User>("users").some((u) => u.email.toLowerCase() === email.toLowerCase())) return bad("A user with that email already exists", 409);
  const user = await createDoc<User>("users", { name, email: email.toLowerCase(), role, passwordHash: await bcrypt.hash(password, 10) });
  return json(strip(user), 201);
}
