"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { Faq as FaqT } from "@/lib/types";
import SplitText from "@/components/motion/SplitText";

export default function Faq({ faqs, title, index }: { faqs: FaqT[]; title: string; index?: string }) {
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);
  return (
    <section className="py-28 sm:py-40">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3">
            {index && <span className="font-mono text-[11px] text-accent">[{index}]</span>}
            <span className="eyebrow">FAQ</span>
          </div>
          <h2 className="display mt-5 text-[clamp(2.4rem,5vw,4.6rem)]">
            <SplitText text={title} />
          </h2>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          {faqs.map((f) => {
            const isOpen = open === f.id;
            return (
              <div key={f.id} className="border-b border-paper/[0.08]">
                <button onClick={() => setOpen(isOpen ? null : f.id)} className="flex w-full items-center justify-between gap-6 py-7 text-left" aria-expanded={isOpen}>
                  <span className={`text-xl font-medium tracking-tight transition-colors sm:text-2xl ${isOpen ? "text-paper" : "text-paper/75"}`}>{f.question}</span>
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.4 }} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors ${isOpen ? "border-accent bg-accent text-on-accent" : "border-paper/15"}`}>
                    <Plus className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
                      <p className="max-w-2xl pb-8 text-[16px] leading-relaxed text-paper/65">{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
