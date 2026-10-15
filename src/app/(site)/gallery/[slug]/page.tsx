import type { Metadata } from "next";
import Link from "next/link";
import { getSingleton, listDocs } from "@/lib/db";
import { accessibleGallery } from "@/lib/gallery";
import { publicIntegrations } from "@/lib/integrations";
import type { PrintProduct } from "@/lib/types";
import GalleryLogin from "@/components/gallery/GalleryLogin";
import ClientGallery from "@/components/gallery/ClientGallery";

export const metadata: Metadata = { title: "Private gallery", robots: { index: false, follow: false } };

export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { gallery, reason } = await accessibleGallery(slug);
  const cfg = publicIntegrations();

  if (!gallery) {
    return (
      <section className="container-x flex min-h-[90svh] flex-col items-start justify-center gap-8 pb-20 pt-36">
        <div>
          <span className="eyebrow">Private gallery</span>
          <h1 className="display mt-5 text-[clamp(2.6rem,6vw,5rem)]">
            {reason === "expired" ? "This gallery has expired." : reason === "missing" ? "Gallery not found." : "Enter your code to continue."}
          </h1>
          <p className="mt-4 max-w-lg text-muted">
            {reason === "expired" ? "Please contact the studio and we'll reopen it for you." : reason === "missing" ? "The link may be mistyped, or the gallery was removed." : "This gallery is private. Use the access code from your email."}
          </p>
        </div>
        {reason === "locked" && <GalleryLogin slug={slug} captcha={{ provider: cfg.captchaProvider, siteKey: cfg.captchaSiteKey }} />}
        {reason !== "locked" && (
          <Link href="/contact" className="btn-primary">
            Contact the studio
          </Link>
        )}
      </section>
    );
  }

  const s = getSingleton("settings");
  return (
    <ClientGallery
      gallery={{ ...gallery, accessCode: "" }}
      products={listDocs<PrintProduct>("printProducts", { published: true }).map((p) => ({ id: p.id, name: p.name, size: p.size, price: p.price, description: p.description }))}
      payments={cfg.razorpay}
      currency={cfg.currency}
      studio={s.siteName}
    />
  );
}
