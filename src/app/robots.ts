import type { MetadataRoute } from "next";
import { getSingleton } from "@/lib/db";
import { baseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const noindex = getSingleton("pages").noindex === "true";
  return {
    rules: [{ userAgent: "*", ...(noindex ? { disallow: "/" } : { allow: "/", disallow: ["/admin", "/api", "/gallery/", "/invoice/", "/contract/", "/pay/"] }) }],
    sitemap: `${await baseUrl()}/sitemap.xml`,
  };
}
