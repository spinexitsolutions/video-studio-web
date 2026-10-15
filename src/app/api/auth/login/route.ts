import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { listDocs } from "@/lib/db";
import { bad, json } from "@/lib/api";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/session";
import type { User } from "@/lib/types";

const attempts = new Map<string, { count: number; until: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const a = attempts.get(ip);
  if (a && a.count >= 8 && a.until > Date.now()) return bad("Too many attempts. Try again in a few minutes.", 429);

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const user = listDocs<User>("users").find((u) => u.email.toLowerCase() === email);
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !ok) {
    const cur = attempts.get(ip);
    attempts.set(ip, { count: (cur && cur.until > Date.now() ? cur.count : 0) + 1, until: Date.now() + 10 * 60_000 });
    return bad("Incorrect email or password.", 401);
  }
  attempts.delete(ip);

  const token = await signSession({ sub: user.id, email: user.email, name: user.name, role: user.role });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return json({ ok: true, user: { name: user.name, email: user.email, role: user.role } });
}
