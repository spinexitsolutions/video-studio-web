import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { listDocs } from "@/lib/db";
import type { Post, Project } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const base = process.env.SITE_URL || `${h.get("x-forwarded-proto") || "https"}://${h.get("host")}`;
  const pages = ["", "/work", "/services", "/pricing", "/about", "/journal", "/contact"].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const }));
  const projects = listDocs<Project>("projects", { published: true }).map((p) => ({ url: `${base}/work/${p.slug}`, lastModified: p.updatedAt }));
  const posts = listDocs<Post>("posts", { published: true }).map((p) => ({ url: `${base}/journal/${p.slug}`, lastModified: p.updatedAt }));
  return [...pages, ...projects, ...posts];
}
