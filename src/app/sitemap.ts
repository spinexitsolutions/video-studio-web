import type { MetadataRoute } from "next";
import { listDocs } from "@/lib/db";
import { baseUrl } from "@/lib/url";
import type { CustomPage, Post, Project, Service } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await baseUrl();
  const pages = ["", "/work", "/services", "/pricing", "/about", "/journal", "/faq", "/contact"].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p ? 0.8 : 1 }));
  const projects = listDocs<Project>("projects", { published: true }).map((p) => ({ url: `${base}/work/${p.slug}`, lastModified: p.updatedAt }));
  const services = listDocs<Service>("services", { published: true }).map((p) => ({ url: `${base}/services/${p.slug}`, lastModified: p.updatedAt, priority: 0.9 }));
  const posts = listDocs<Post>("posts", { published: true }).map((p) => ({ url: `${base}/journal/${p.slug}`, lastModified: p.updatedAt }));
  const custom = listDocs<CustomPage>("customPages", { published: true }).map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt, priority: 0.3 }));
  return [...pages, ...services, ...projects, ...posts, ...custom];
}
