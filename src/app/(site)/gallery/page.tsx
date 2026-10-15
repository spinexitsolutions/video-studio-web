import type { Metadata } from "next";
import PageHeader from "@/components/sections/PageHeader";
import GalleryLogin from "@/components/gallery/GalleryLogin";
import { publicIntegrations } from "@/lib/integrations";
import { pageHeader, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return { ...pageMetadata("gallery", { title: "Client gallery", description: "Private client galleries." }), robots: { index: false } };
}

export default function GalleryLoginPage() {
  const h = pageHeader("gallery");
  const cfg = publicIntegrations();
  return (
    <>
      <PageHeader eyebrow={h.eyebrow} title={h.title} subtitle={h.subtitle} />
      <section className="container-x flex justify-start pb-32">
        <GalleryLogin captcha={{ provider: cfg.captchaProvider, siteKey: cfg.captchaSiteKey }} />
      </section>
    </>
  );
}
