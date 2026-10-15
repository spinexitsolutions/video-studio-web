/** Editable headers + SEO for every static page. Used by the seed, the admin schema and the pages. */
export const PAGE_DEFS = [
  { key: "home", label: "Home", header: false, eyebrow: "", title: "", subtitle: "" },
  { key: "work", label: "Work", header: true, eyebrow: "Portfolio", title: "Selected work.", subtitle: "Weddings, campaigns, portraits and films — a few of the stories we've been trusted to tell." },
  { key: "services", label: "Services", header: true, eyebrow: "Services", title: "What we do best.", subtitle: "From a ten-minute headshot to a ten-city film tour — every project gets a dedicated team, a clear plan and our full obsession." },
  { key: "pricing", label: "Pricing", header: true, eyebrow: "Pricing", title: "Honest, simple pricing.", subtitle: "Every project is unique — these are starting points. Custom quotes in 24 hours." },
  { key: "about", label: "Studio / About", header: false, eyebrow: "", title: "", subtitle: "" },
  { key: "journal", label: "Journal", header: true, eyebrow: "Journal", title: "Notes on light.", subtitle: "Field guides, behind-the-scenes and the stories behind our favourite frames." },
  { key: "faq", label: "FAQ", header: true, eyebrow: "Help centre", title: "Questions, answered.", subtitle: "Everything you need to know about booking, shoots, delivery and payments." },
  { key: "contact", label: "Contact & booking", header: true, eyebrow: "Contact & booking", title: "Let's talk.", subtitle: "Tell us a little about your project. We reply to every enquiry within 24 hours — usually much sooner." },
  { key: "gallery", label: "Client gallery login", header: true, eyebrow: "Client area", title: "Your private gallery.", subtitle: "Enter the gallery code we sent you to view, favourite and download your photos." },
] as const;

export type PageKey = (typeof PAGE_DEFS)[number]["key"];

export function defaultPageContent() {
  const out: Record<string, string> = {};
  for (const p of PAGE_DEFS) {
    out[`${p.key}_eyebrow`] = p.eyebrow;
    out[`${p.key}_title`] = p.title;
    out[`${p.key}_subtitle`] = p.subtitle;
    out[`${p.key}_metaTitle`] = "";
    out[`${p.key}_metaDescription`] = "";
    out[`${p.key}_ogImage`] = "";
  }
  out.siteUrl = "";
  out.googleVerification = "";
  out.noindex = "";
  return out;
}
