"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/lib/types";
import Img from "@/components/site/Img";
import ServiceIcon from "@/components/site/ServiceIcon";
import SectionHeading from "./SectionHeading";
import { cn } from "@/lib/utils";

// Bento layout pattern (repeats every 6 items)
const LAYOUT = [
  "md:col-span-4 md:row-span-2",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-3",
  "md:col-span-3",
  "md:col-span-6",
];

function Card({ s, i }: { s: Service; i: number }) {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const spot = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, rgb(var(--accent-rgb) / 0.18), transparent 70%)`;
  const big = i % 6 === 0;
  const wide = i % 6 === 5;

  return (
    <motion.div
      className={cn("group relative min-h-[280px] overflow-hidden rounded-[28px] border border-white/[0.07] bg-ink-100", LAYOUT[i % 6])}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      data-cursor-label="Explore"
    >
      <Link href={`/services#${s.slug}`} className="absolute inset-0 z-20" aria-label={s.title} />
      {s.image && (
        <div className={cn("absolute inset-0 transition-opacity duration-700", big || wide ? "opacity-60 group-hover:opacity-80" : "opacity-0 group-hover:opacity-50")}>
          <Img src={s.image} alt="" className="h-full w-full scale-105 object-cover transition-transform duration-[1.6s] ease-expo group-hover:scale-100" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
        </div>
      )}
      <motion.div className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: spot }} />
      <div className="relative z-10 flex h-full flex-col justify-between p-7 sm:p-9">
        <div className="flex items-start justify-between">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md transition-colors duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-black">
            <ServiceIcon name={s.icon} className="h-5 w-5" />
          </span>
          <span className="font-mono text-[11px] text-muted">{String(i + 1).padStart(2, "0")}</span>
        </div>
        <div className={cn(big && "md:max-w-md")}>
          <h3 className={cn("font-semibold tracking-tight", big ? "text-4xl sm:text-5xl" : "text-2xl")}>{s.title}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-paper/65">{s.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {(s.features || []).slice(0, big ? 4 : 3).map((f) => (
              <span key={f} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-paper/70 backdrop-blur-md">
                {f}
              </span>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between text-sm">
            {s.startingPrice && (
              <span className="text-muted">
                From <span className="text-paper">{s.startingPrice}</span>
              </span>
            )}
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:text-accent">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Services({ services, eyebrow, title, index }: { services: Service[]; eyebrow: string; title: string; index?: string }) {
  return (
    <section className="relative py-28 sm:py-40">
      <div className="container-x">
        <SectionHeading eyebrow={eyebrow} title={title} index={index}>
          <Link href="/services" className="btn-ghost shrink-0">
            All services <ArrowUpRight className="h-4 w-4" />
          </Link>
        </SectionHeading>
        <div className="mt-16 grid auto-rows-[minmax(280px,auto)] gap-4 md:grid-cols-6">
          {services.map((s, i) => (
            <Card key={s.id} s={s} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
