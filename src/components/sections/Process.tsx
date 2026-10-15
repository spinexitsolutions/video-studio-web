"use client";

import { motion, useScroll } from "framer-motion";
import { useRef } from "react";
import type { ProcessStep } from "@/lib/types";
import SplitText from "@/components/motion/SplitText";

export default function Process({ steps, title, index }: { steps: ProcessStep[]; title: string; index?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  return (
    <section className="py-28 sm:py-40">
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <div className="flex items-center gap-3">
              {index && <span className="font-mono text-[11px] text-accent">[{index}]</span>}
              <span className="eyebrow">How we work</span>
            </div>
            <h2 className="display mt-5 text-[clamp(2.4rem,5vw,4.6rem)]">
              <SplitText text={title} />
            </h2>
            <p className="mt-6 max-w-sm text-muted">A clear, calm process — so you always know what happens next, and can simply enjoy the day.</p>
          </div>
        </div>
        <div ref={ref} className="relative lg:col-span-6 lg:col-start-7">
          <div className="absolute bottom-0 left-[19px] top-0 w-px bg-paper/10">
            <motion.div className="h-full w-full origin-top bg-accent" style={{ scaleY: scrollYProgress }} />
          </div>
          <ol className="space-y-16">
            {steps.map((s, i) => (
              <motion.li
                key={s.id}
                className="relative pl-16"
                initial={{ opacity: 0.25 }}
                whileInView={{ opacity: 1 }}
                viewport={{ margin: "-45% 0px -45% 0px" }}
                transition={{ duration: 0.6 }}
              >
                <span className="absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full border border-paper/15 bg-ink font-mono text-xs">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{s.duration}</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{s.title}</h3>
                <p className="mt-3 max-w-md text-[16px] leading-relaxed text-paper/65">{s.description}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
