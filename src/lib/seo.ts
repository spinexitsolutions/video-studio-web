import type { Metadata } from "next";
import { getSingleton } from "./db";
import { PAGE_DEFS, type PageKey } from "./page-content";

/** Header text for a static page, editable in Admin → Page headers & SEO. */
export function pageHeader(key: PageKey) {
  const p = getSingleton("pages");
  const def = PAGE_DEFS.find((d) => d.key === key)!;
  return { eyebrow: p[`${key}_eyebrow`] || def.eyebrow, title: p[`${key}_title`] || def.title, subtitle: p[`${key}_subtitle`] || def.subtitle };
}

/** Metadata for a static page with admin overrides. */
export function pageMetadata(key: PageKey, fallback: { title: string; description?: string; image?: string }): Metadata {
  const p = getSingleton("pages");
  const title = p[`${key}_metaTitle`] || fallback.title;
  const description = p[`${key}_metaDescription`] || fallback.description;
  const image = p[`${key}_ogImage`] || fallback.image;
  return { title, description, openGraph: { title, description, images: image ? [image] : undefined }, alternates: p.siteUrl ? { canonical: key === "home" ? "/" : undefined } : undefined };
}
