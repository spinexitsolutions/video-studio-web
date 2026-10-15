import { SignJWT, jwtVerify } from "jose";

/** Edge-safe session helpers (used by middleware and server code). */
export const SESSION_COOKIE = "studio_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: "admin" | "editor";
}

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === "production") {
    console.warn("[auth] AUTH_SECRET is not set — using an insecure fallback. Set it in your environment!");
  }
  return new TextEncoder().encode(s || "dev-insecure-secret-change-me-please-0123456789");
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
