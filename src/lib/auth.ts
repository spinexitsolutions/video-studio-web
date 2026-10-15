import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDoc } from "./db";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "./session";
import type { User } from "./types";

/** Returns the signed-in user (re-validated against the database) or null. */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = getDoc<User>("users", session.sub);
  if (!user) return null;
  return { sub: user.id, email: user.email, name: user.name, role: user.role };
}

/** For API route handlers: returns [user, null] or [null, 401 response]. */
export async function requireUser(role?: "admin"): Promise<[SessionPayload, null] | [null, NextResponse]> {
  const user = await getCurrentUser();
  if (!user) return [null, NextResponse.json({ error: "Unauthorized" }, { status: 401 })];
  if (role === "admin" && user.role !== "admin") {
    return [null, NextResponse.json({ error: "Only admins can do that" }, { status: 403 })];
  }
  return [user, null];
}
