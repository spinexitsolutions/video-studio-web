import { getSingleton } from "@/lib/db";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import Preloader from "@/components/site/Preloader";
import Cursor from "@/components/site/Cursor";
import ScrollProgress from "@/components/site/ScrollProgress";
import WhatsApp from "@/components/site/WhatsApp";
import SiteScripts from "@/components/site/SiteScripts";
import { publicIntegrations } from "@/lib/integrations";
import { listDocs } from "@/lib/db";
import type { CustomPage } from "@/lib/types";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = getSingleton("settings");
  const cfg = publicIntegrations();
  const legal = listDocs<CustomPage>("customPages", { published: true })
    .filter((p) => p.showInFooter)
    .map((p) => ({ href: `/${p.slug}`, label: p.title }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: settings.siteName,
    description: settings.metaDescription,
    email: settings.email,
    telephone: settings.phone,
    image: settings.ogImage,
    address: { "@type": "PostalAddress", streetAddress: settings.address, addressLocality: settings.city },
    openingHours: settings.hours,
    sameAs: [settings.instagram, settings.youtube, settings.vimeo, settings.behance, settings.facebook, settings.linkedin].filter(Boolean),
  };
  return (
    <div className={[settings.showCursor ? "custom-cursor" : "", cfg.protectImages ? "protect-images" : ""].join(" ")}>
      <SiteScripts cfg={cfg} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SmoothScroll />
      {settings.showPreloader && <Preloader name={settings.siteName} />}
      {settings.showCursor && <Cursor />}
      <ScrollProgress />
      <Navbar settings={settings} />
      <main className="relative">{children}</main>
      <Footer settings={settings} legal={legal} captcha={{ provider: cfg.captchaProvider, siteKey: cfg.captchaSiteKey }} />
      <WhatsApp number={settings.whatsapp} />
      {settings.showGrain && <div className="grain animate-grain" aria-hidden />}
    </div>
  );
}
