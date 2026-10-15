import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = () => new TextEncoder().encode((process.env.AUTH_SECRET || "dev-insecure-secret-change-me-please-0123456789") + ":gallery");
const cookieName = (id: string) => `gal_${id}`;

export async function grantGallery(id: string) {
  const token = await new SignJWT({ g: id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30d").sign(secret());
  (await cookies()).set(cookieName(id), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function hasGalleryAccess(id: string) {
  const token = (await cookies()).get(cookieName(id))?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload.g === id;
  } catch {
    return false;
  }
}

export async function revokeGallery(id: string) {
  (await cookies()).delete(cookieName(id));
}
