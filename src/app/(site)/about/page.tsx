import type { Metadata } from "next";
import { getSingleton, listDocs } from "@/lib/db";
import type { Stat, TeamMember, Testimonial } from "@/lib/types";
import { renderMarkdown } from "@/lib/markdown";
import PageHeader from "@/components/sections/PageHeader";
import ParallaxImage from "@/components/motion/ParallaxImage";
import Reveal from "@/components/motion/Reveal";
import ScrollWords from "@/components/motion/ScrollWords";
import Stats from "@/components/sections/Stats";
import Team from "@/components/sections/Team";
import Testimonials from "@/components/sections/Testimonials";
import Cta from "@/components/sections/Cta";

export const metadata: Metadata = { title: "Studio", description: "Meet the studio and the people behind the lens." };

export default function AboutPage() {
  const about = getSingleton("about");
  const home = getSingleton("home");
  return (
    <>
      <PageHeader eyebrow={about.eyebrow} title={about.title} />
      <ParallaxImage src={about.image} alt="" className="mx-3 aspect-[4/5] rounded-[28px] sm:mx-6 sm:aspect-[21/9]" />
      <section className="container-x py-28 sm:py-40">
        <ScrollWords text={about.intro} highlight={["light", "camera", "lens", "world"]} className="max-w-5xl text-[clamp(1.6rem,3.4vw,3.2rem)] font-medium leading-[1.15] tracking-[-0.025em]" />
        <div className="mt-20 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <span className="eyebrow">Our story</span>
          </div>
          <div className="prose-studio lg:col-span-7 lg:col-start-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(about.story) }} />
        </div>
      </section>

      <section className="container-x pb-24">
        <span className="eyebrow">What we believe</span>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {about.values.map((v, i) => (
            <Reveal key={v} delay={i * 0.08}>
              <div className="card flex h-full min-h-[220px] flex-col justify-between p-8">
                <span className="font-mono text-xs text-accent">0{i + 1}</span>
                <p className="text-2xl font-semibold tracking-tight">{v}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Stats stats={listDocs<Stat>("stats", { published: true })} />
      <Team team={listDocs<TeamMember>("team", { published: true })} title={home.teamTitle} />

      <section className="container-x grid gap-16 py-24 lg:grid-cols-2">
        {[
          ["Recognition", about.awards],
          ["Our kit", about.equipment],
        ].map(([label, items]) => (
          <div key={label as string}>
            <span className="eyebrow">{label as string}</span>
            <ul className="mt-8 border-t border-white/[0.08]">
              {(items as string[]).map((a, i) => (
                <Reveal key={a} delay={i * 0.05}>
                  <li className="group flex items-center justify-between border-b border-white/[0.08] py-5 text-lg transition-colors hover:text-accent">
                    {a}
                    <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <Testimonials items={listDocs<Testimonial>("testimonials", { published: true })} title={home.testimonialsTitle} />
      <Cta title={home.ctaTitle} subtitle={home.ctaSubtitle} image={home.ctaImage} />
    </>
  );
}
