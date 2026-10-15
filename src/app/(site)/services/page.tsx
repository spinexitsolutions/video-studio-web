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

export const metadata: Metadata = { title: "Services", description: "Photography and film services for weddings, brands and people." };

export default function ServicesPage() {
  const services = listDocs<Service>("services", { published: true });
  const home = getSingleton("home");
  return (
    <>
      <PageHeader eyebrow="Services" title="What we do best." subtitle="From a ten-minute headshot to a ten-city film tour — every project gets a dedicated team, a clear plan and our full obsession." />
      <div className="container-x space-y-28 pb-24 sm:space-y-40">
        {services.map((s, i) => (
          <section key={s.id} id={s.slug} className="grid scroll-mt-32 items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <ParallaxImage src={s.image} alt={s.title} className={`aspect-[4/5] rounded-[28px] lg:col-span-6 ${i % 2 ? "lg:order-2 lg:col-start-7" : ""}`} />
            <div className={`lg:col-span-5 ${i % 2 ? "lg:order-1" : "lg:col-start-8"}`}>
              <Reveal>
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-black">
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
                  <Link href={`/contact?service=${encodeURIComponent(s.title)}`} className="btn-primary">
                    Enquire <ArrowUpRight className="h-4 w-4" />
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
