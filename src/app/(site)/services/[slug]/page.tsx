import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { findDoc, getSingleton, listDocs } from "@/lib/db";
import type { Faq as FaqT, Package, ProcessStep, Project, Service, Testimonial } from "@/lib/types";
import ParallaxImage from "@/components/motion/ParallaxImage";
import SplitText from "@/components/motion/SplitText";
import Reveal from "@/components/motion/Reveal";
import ServiceIcon from "@/components/site/ServiceIcon";
import WorkGrid from "@/components/sections/WorkGrid";
import Process from "@/components/sections/Process";
import Pricing from "@/components/sections/Pricing";
import Testimonials from "@/components/sections/Testimonials";
import Faq from "@/components/sections/Faq";
import Cta from "@/components/sections/Cta";

type Props = { params: Promise<{ slug: string }> };

// map service slugs to portfolio categories for the "related work" grid
const CATEGORY: Record<string, string[]> = { weddings: ["Wedding"], commercial: ["Commercial", "Product"], film: ["Film", "Events"], portraits: ["Portrait"], fashion: ["Fashion"], events: ["Events"] };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = findDoc<Service>("services", "slug", slug);
  if (!s) return {};
  const city = getSingleton("settings").city.split(",")[0];
  return { title: `${s.title}${city ? ` in ${city}` : ""}`, description: s.summary, openGraph: { images: s.image ? [s.image] : [] } };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const s = findDoc<Service>("services", "slug", slug);
  if (!s || s.published === false) notFound();
  const home = getSingleton("home");
  const settings = getSingleton("settings");
  const cats = CATEGORY[slug] || [];
  const related = listDocs<Project>("projects", { published: true }).filter((p) => cats.includes(p.category) || p.title.toLowerCase().includes(s.title.split(" ")[0].toLowerCase()));
  const others = listDocs<Service>("services", { published: true }).filter((x) => x.id !== s.id);

  return (
    <>
      <header className="container-x pb-14 pt-40 sm:pt-48">
        <Link href="/services" className="eyebrow hover:text-paper">
          All services
        </Link>
        <div className="mt-6 flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-on-accent">
            <ServiceIcon name={s.icon} className="h-6 w-6" />
          </span>
          {s.startingPrice && <span className="text-muted">from <span className="text-paper">{s.startingPrice}</span></span>}
        </div>
        <h1 className="display mt-8 max-w-5xl text-[clamp(3rem,8vw,8rem)]">
          <SplitText text={s.title} by="char" stagger={0.02} />
        </h1>
        <Reveal delay={0.3}>
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted">
            {s.summary} {settings.city && <>Based in {settings.city}, available worldwide.</>}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={`/contact?service=${encodeURIComponent(s.title)}`} className="btn-accent">
              Check availability <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="btn-ghost">
              See pricing
            </Link>
          </div>
        </Reveal>
      </header>
      <ParallaxImage src={s.image} alt={s.title} className="mx-3 aspect-[4/5] rounded-[calc(28px*var(--rs))] sm:mx-6 sm:aspect-[21/9]" />
      <section className="container-x grid gap-12 py-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <span className="eyebrow">What&apos;s included</span>
          <p className="mt-6 text-2xl font-medium leading-snug tracking-tight">{s.description}</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
          {(s.features || []).map((f, i) => (
            <Reveal key={f} delay={i * 0.06}>
              <li className="card flex items-center gap-3 p-5 text-[15px]">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                  <Check className="h-4 w-4" />
                </span>
                {f}
              </li>
            </Reveal>
          ))}
        </ul>
      </section>
      {related.length > 0 && (
        <>
          <div className="container-x pb-10">
            <h2 className="display text-[clamp(2.2rem,4.5vw,4rem)]">Recent {s.title.toLowerCase()} work</h2>
          </div>
          <WorkGrid projects={related} />
        </>
      )}
      <Process steps={listDocs<ProcessStep>("process", { published: true })} title={home.processTitle} />
      <Pricing packages={listDocs<Package>("packages", { published: true })} title={home.pricingTitle} subtitle={home.pricingSubtitle} />
      <Testimonials items={listDocs<Testimonial>("testimonials", { published: true })} title={home.testimonialsTitle} />
      <Faq faqs={listDocs<FaqT>("faqs", { published: true })} title={home.faqTitle} />
      {others.length > 0 && (
        <section className="container-x py-20">
          <span className="eyebrow">Other services</span>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (
              <Link key={o.id} href={`/services/${o.slug}`} className="card group flex items-center justify-between p-6 transition hover:border-accent/50">
                <span className="flex items-center gap-3">
                  <ServiceIcon name={o.icon} className="h-5 w-5 text-accent" />
                  {o.title}
                </span>
                <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:rotate-45 group-hover:text-accent" />
              </Link>
            ))}
          </div>
        </section>
      )}
      <Cta title={home.ctaTitle} subtitle={home.ctaSubtitle} image={home.ctaImage} />
    </>
  );
}
