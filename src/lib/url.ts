import { headers } from "next/headers";
import { getSingleton } from "./db";

/** Public base URL for links in emails, sitemaps and payment callbacks. */
export async function baseUrl() {
  const configured = getSingleton("pages").siteUrl || process.env.SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    if (host) return `${h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https")}://${host}`;
  } catch {}
  return "http://localhost:3000";
}

export function clientIp(req: Request) {
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}
