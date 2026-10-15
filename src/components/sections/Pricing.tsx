"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Package } from "@/lib/types";
import SectionHeading from "./SectionHeading";
import { cn } from "@/lib/utils";

export default function Pricing({ packages, title, subtitle, index }: { packages: Package[]; title: string; subtitle?: string; index?: string }) {
  return (
    <section className="py-28 sm:py-40">
      <div className="container-x">
        <SectionHeading eyebrow="Investment" title={title} subtitle={subtitle} index={index} />
        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {packages.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 1, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className={cn("relative rounded-[calc(30px*var(--rs))] p-px", p.highlighted ? "overflow-hidden" : "")}
            >
              {p.highlighted && (
                <div className="absolute inset-[-100%] animate-spin-slow bg-[conic-gradient(from_0deg,transparent_0%,rgb(var(--accent-rgb))_10%,transparent_25%,transparent_50%,rgb(var(--accent-rgb)/.6)_60%,transparent_75%)] [animation-duration:6s]" />
              )}
              <div className={cn("relative flex h-full flex-col rounded-[calc(29px*var(--rs))] border p-8 sm:p-10", p.highlighted ? "border-transparent bg-ink-100" : "border-paper/[0.07] bg-ink-50")}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-medium">{p.name}</h3>
                  {p.highlighted && <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-on-accent">Most popular</span>}
                </div>
                <div className="mt-8 flex items-baseline gap-2">
                  <span className="text-5xl font-semibold tracking-tight">{p.price}</span>
                  <span className="text-sm text-muted">{p.unit}</span>
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-paper/65">{p.description}</p>
                <ul className="mt-8 flex-1 space-y-3.5 border-t border-paper/[0.07] pt-8">
                  {(p.features || []).map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[15px]">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/contact?package=${encodeURIComponent(p.name)}`} className={cn("mt-10 w-full", p.highlighted ? "btn-accent" : "btn-ghost")}>
                  {p.ctaLabel || "Book now"}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
