import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSingleton, listDocs } from "@/lib/db";
import type { Faq as FaqT, Package, Service } from "@/lib/types";
import PageHeader from "@/components/sections/PageHeader";
import Pricing from "@/components/sections/Pricing";
import Faq from "@/components/sections/Faq";
import Reveal from "@/components/motion/Reveal";
import { pageHeader, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("pricing", { title: "Pricing", description: "Transparent pricing for photography and film." });
}

export default function PricingPage() {
  const home = getSingleton("home");
  const h = pageHeader("pricing");
  const services = listDocs<Service>("services", { published: true });
  return (
    <>
      <PageHeader eyebrow={h.eyebrow} title={h.title} subtitle={h.subtitle} />
      <div className="-mt-28">
        <Pricing packages={listDocs<Package>("packages", { published: true })} title="Packages" />
      </div>
      <section className="container-x pb-24">
        <Reveal>
          <div className="card overflow-hidden">
            <div className="grid divide-y divide-paper/[0.07] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
              {services.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-4 p-6 [&:nth-child(n+4)]:lg:border-t [&:nth-child(n+4)]:lg:border-paper/[0.07]">
                  <div>
                    <p className="font-medium">{s.title}</p>
                    <p className="text-sm text-muted">{s.summary}</p>
                  </div>
                  <p className="shrink-0 text-right text-sm text-muted">
                    from
                    <br />
                    <span className="text-lg font-semibold text-paper">{s.startingPrice}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal>
          <div className="mt-6 flex flex-col items-start justify-between gap-6 rounded-[calc(28px*var(--rs))] bg-accent p-10 text-on-accent sm:flex-row sm:items-center">
            <div>
              <h3 className="text-3xl font-semibold tracking-tight">Need something custom?</h3>
              <p className="mt-2 text-on-accent/70">Tell us about your project — we&apos;ll send a tailored quote within 24 hours.</p>
            </div>
            <Link href="/contact" className="btn bg-ink text-paper hover:bg-ink-200">
              Get a quote <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
      <Faq faqs={listDocs<FaqT>("faqs", { published: true })} title={home.faqTitle} />
    </>
  );
}
