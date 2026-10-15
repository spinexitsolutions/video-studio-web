"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import type { Project } from "@/lib/types";
import Img from "@/components/site/Img";
import SplitText from "@/components/motion/SplitText";

function Sprockets() {
  return (
    <div
      aria-hidden
      className="h-7"
      style={{
        backgroundImage: "linear-gradient(90deg, #050506 0 20px, transparent 20px 38px)",
        backgroundSize: "38px 14px",
        backgroundPosition: "12px center",
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}

/** Pinned horizontal gallery styled like a strip of 35mm film. */
export default function FilmStrip({ projects, eyebrow, title, brand, index }: { projects: Project[]; eyebrow: string; title: string; brand: string; index?: string }) {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const last = useRef<HTMLAnchorElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const skew = useTransform(scrollYProgress, [0, 0.5, 1], [0, -1.5, 0]);

  useEffect(() => {
    // distance = how far the last frame sits beyond the viewport (measured untransformed)
    const measure = () => {
      if (!track.current || !last.current) return;
      let end = last.current.offsetWidth;
      for (let el: HTMLElement | null = last.current; el && el !== track.current; el = el.offsetParent as HTMLElement | null) end += el.offsetLeft;
      const pad = window.innerWidth >= 1024 ? 48 : window.innerWidth >= 640 ? 32 : 20;
      setDistance(Math.max(0, end + pad + 12 - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  return (
    <section ref={ref} className="relative" style={{ height: `calc(100svh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="container-x mb-10 flex items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              {index && <span className="font-mono text-[11px] text-accent">[{index}]</span>}
              <span className="eyebrow">{eyebrow}</span>
            </div>
            <h2 className="display mt-5 text-[clamp(2.4rem,5.5vw,5rem)]">
              <SplitText text={title} />
            </h2>
          </div>
          <Link href="/work" className="btn-ghost hidden shrink-0 sm:inline-flex">
            Full portfolio <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <motion.div ref={track} style={{ x, skewX: skew }} className="relative flex w-max will-change-transform">
          <div className="w-5 shrink-0 sm:w-8 lg:w-12" />
          <div className="on-dark relative rounded-md bg-[#151517] py-1 shadow-[0_30px_80px_rgba(0,0,0,.5)]">
            <Sprockets />
            <div className="relative flex gap-3 px-3">
              {projects.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/work/${p.slug}`}
                  className="group relative block w-[78vw] shrink-0 sm:w-[46vw] lg:w-[34vw]"
                  data-cursor-label={p.kind === "video" ? "Play" : "View"}
                >
                  <div className="relative aspect-[3/2] overflow-hidden rounded-[3px] bg-ink-200">
                    <Img src={p.cover} alt={p.title} loading="eager" className="h-full w-full object-cover transition-all duration-[1.4s] ease-expo group-hover:scale-[1.06]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-90 transition-opacity duration-700 group-hover:opacity-100" />
                    {p.kind === "video" && (
                      <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] backdrop-blur-md">
                        <Play className="h-3 w-3 fill-current" /> Film
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                          {p.category} · {p.year}
                        </p>
                        <h3 className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">{p.title}</h3>
                      </div>
                      <span className="grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-white text-black opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-1 pt-1.5 font-mono text-[10px] font-medium tracking-[0.12em] text-[#ff9a3c]">
                    <span>▸ {i * 2 + 12}A</span>
                    <span className="hidden sm:inline">{brand.toUpperCase()} 400 · SAFETY FILM</span>
                    <span>{i * 2 + 13}</span>
                  </div>
                </Link>
              ))}
              <Link ref={last} href="/work" className="group grid w-[60vw] shrink-0 place-items-center sm:w-[30vw] lg:w-[22vw]" data-cursor="hover">
                <div className="text-center">
                  <span className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-paper/15 transition-all duration-700 ease-expo group-hover:scale-110 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
                    <ArrowUpRight className="h-7 w-7" />
                  </span>
                  <p className="mt-5 text-lg font-medium">See all work</p>
                </div>
              </Link>
            </div>
            <Sprockets />
          </div>
          <div className="w-5 shrink-0 sm:w-8 lg:w-12" />
        </motion.div>

        <div className="container-x mt-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-paper/10">
            <motion.div className="h-full origin-left bg-paper/70" style={{ scaleX: scrollYProgress }} />
          </div>
          <span className="font-mono text-[11px] text-muted">Scroll</span>
        </div>
      </div>
    </section>
  );
}
