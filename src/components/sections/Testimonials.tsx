"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import Img from "@/components/site/Img";
import SplitText from "@/components/motion/SplitText";

export default function Testimonials({ items, title, index }: { items: Testimonial[]; title: string; index?: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || items.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % items.length), 7000);
    return () => clearInterval(id);
  }, [paused, items.length]);
  if (!items.length) return null;
  const t = items[i];

  return (
    <section className="relative overflow-hidden py-28 sm:py-40" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="container-x">
        <div className="flex items-center gap-3">
          {index && <span className="font-mono text-[11px] text-accent">[{index}]</span>}
          <span className="eyebrow">{title}</span>
        </div>
        <div className="relative mt-12 min-h-[340px] sm:min-h-[300px]">
          <span className="serif-i pointer-events-none absolute -left-2 -top-16 select-none text-[16rem] leading-none text-accent/20">“</span>
          <AnimatePresence mode="wait">
            <motion.blockquote key={t.id} exit={{ opacity: 0, y: -20, filter: "blur(8px)" }} transition={{ duration: 0.4 }} className="relative">
              <p className="max-w-5xl text-[clamp(1.7rem,3.8vw,3.4rem)] font-medium leading-[1.15] tracking-[-0.025em]">
                <SplitText text={t.quote} immediate stagger={0.025} />
              </p>
              <motion.footer initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-10 flex items-center gap-4">
                <Img src={t.avatar} alt={t.name} className="h-14 w-14 rounded-full object-cover" />
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-sm text-muted">{t.role}</p>
                </div>
                <div className="ml-4 flex gap-0.5 text-accent">
                  {Array.from({ length: Math.max(0, Math.min(5, Number(t.rating) || 5)) }).map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </motion.footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
        <div className="mt-14 flex items-center justify-between">
          <div className="flex gap-2">
            {items.map((it, k) => (
              <button
                key={it.id}
                onClick={() => setI(k)}
                aria-label={`Testimonial ${k + 1}`}
                className={`relative h-12 w-12 overflow-hidden rounded-full border-2 transition-all duration-500 ${k === i ? "border-accent" : "border-transparent opacity-40 hover:opacity-80"}`}
              >
                <Img src={it.avatar} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setI((i - 1 + items.length) % items.length)} aria-label="Previous" className="grid h-12 w-12 place-items-center rounded-full border border-white/15 transition hover:bg-white hover:text-black">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setI((i + 1) % items.length)} aria-label="Next" className="grid h-12 w-12 place-items-center rounded-full border border-white/15 transition hover:bg-white hover:text-black">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
