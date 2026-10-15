"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import type { Project } from "@/lib/types";
import Img from "@/components/site/Img";
import { cn } from "@/lib/utils";

const RATIOS = ["aspect-[4/5]", "aspect-[3/2]", "aspect-square", "aspect-[3/4]", "aspect-[16/10]"];

export default function WorkGrid({ projects }: { projects: Project[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))], [projects]);
  const [cat, setCat] = useState("All");
  const [kind, setKind] = useState<"all" | "photo" | "video">("all");
  const list = projects.filter((p) => (cat === "All" || p.category === cat) && (kind === "all" || p.kind === kind));

  return (
    <section className="container-x pb-32">
      <div className="sticky top-24 z-20 -mx-2 mb-12 flex flex-wrap items-center justify-between gap-4 py-3">
        <div className="glass flex max-w-full gap-1 overflow-x-auto rounded-full p-1.5 no-scrollbar">
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn("relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors", cat === c ? "text-ink" : "text-paper/70 hover:text-paper")}>
              {cat === c && <motion.span layoutId="work-cat" className="absolute inset-0 rounded-full bg-paper" transition={{ type: "spring", stiffness: 400, damping: 35 }} />}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>
        <div className="glass flex gap-1 rounded-full p-1.5">
          {(["all", "photo", "video"] as const).map((k) => (
            <button key={k} onClick={() => setKind(k)} className={cn("relative rounded-full px-4 py-2 text-sm capitalize transition-colors", kind === k ? "text-on-accent" : "text-paper/70 hover:text-paper")}>
              {kind === k && <motion.span layoutId="work-kind" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 400, damping: 35 }} />}
              <span className="relative">{k === "all" ? "Everything" : k === "photo" ? "Photo" : "Film"}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.div
              layout
              key={p.id}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.7, delay: (i % 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="mb-5 break-inside-avoid"
            >
              <Link href={`/work/${p.slug}`} className="group block" data-cursor-label={p.kind === "video" ? "Play" : "View"}>
                <div className={cn("relative overflow-hidden rounded-[calc(22px*var(--rs))] bg-ink-200", RATIOS[i % RATIOS.length])}>
                  <Img src={p.cover} alt={p.title} className="h-full w-full object-cover transition-transform duration-[1.4s] ease-expo group-hover:scale-[1.06]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                  {p.kind === "video" && (
                    <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/40 text-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] backdrop-blur-md">
                      <Play className="h-3 w-3 fill-current" /> Film
                    </span>
                  )}
                  <span className="absolute bottom-4 right-4 grid h-11 w-11 translate-y-3 place-items-center rounded-full bg-white text-black opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-4 flex items-start justify-between gap-4 px-1">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">{p.title}</h3>
                    <p className="mt-1 text-sm text-muted">{p.client}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
                    {p.category} · {p.year}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="py-24 text-center text-muted">No projects in this category yet.</p>}
    </section>
  );
}
