import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { getSingleton, listDocs } from "@/lib/db";
import type { Faq as FaqT, ProcessStep, Service } from "@/lib/types";
import PageHeader from "@/components/sections/PageHeader";
import ParallaxImage from "@/components/motion/ParallaxImage";
import Reveal from "@/components/motion/Reveal";
import Process from "@/components/sections/Process";
import Faq from "@/components/sections/Faq";
import ServiceIcon from "@/components/site/ServiceIcon";
import { pageHeader, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("services", { title: "Services", description: "Photography and film services for weddings, brands and people." });
}

export default function ServicesPage() {
  const services = listDocs<Service>("services", { published: true });
  const home = getSingleton("home");
  const h = pageHeader("services");
  return (
    <>
      <PageHeader eyebrow={h.eyebrow} title={h.title} subtitle={h.subtitle} />
      <div className="container-x space-y-28 pb-24 sm:space-y-40">
        {services.map((s, i) => (
          <section key={s.id} id={s.slug} className="grid scroll-mt-32 items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <ParallaxImage src={s.image} alt={s.title} className={`aspect-[4/5] rounded-[calc(28px*var(--rs))] lg:col-span-6 ${i % 2 ? "lg:order-2 lg:col-start-7" : ""}`} />
            <div className={`lg:col-span-5 ${i % 2 ? "lg:order-1" : "lg:col-start-8"}`}>
              <Reveal>
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-on-accent">
                    <ServiceIcon name={s.icon} className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-[11px] text-muted">{String(i + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}</span>
                </div>
                <h2 className="display mt-8 text-[clamp(2.4rem,4.5vw,4.2rem)]">{s.title}</h2>
                <p className="mt-5 text-lg leading-relaxed text-paper/70">{s.summary}</p>
                {s.description && <p className="mt-3 leading-relaxed text-muted">{s.description}</p>}
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {(s.features || []).map((f) => (
                    <li key={f} className="flex items-center gap-3 text-[15px]">
                      <Check className="h-4 w-4 text-accent" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex flex-wrap items-center gap-6">
                  <Link href={`/services/${s.slug}`} className="btn-primary">
                    Explore <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link href={`/contact?service=${encodeURIComponent(s.title)}`} className="btn-ghost">
                    Enquire
                  </Link>
                  {s.startingPrice && (
                    <span className="text-muted">
                      Starting at <span className="text-xl font-semibold text-paper">{s.startingPrice}</span>
                    </span>
                  )}
                </div>
              </Reveal>
            </div>
          </section>
        ))}
      </div>
      <Process steps={listDocs<ProcessStep>("process", { published: true })} title={home.processTitle} />
      <Faq faqs={listDocs<FaqT>("faqs", { published: true })} title={home.faqTitle} />
    </>
  );
}
