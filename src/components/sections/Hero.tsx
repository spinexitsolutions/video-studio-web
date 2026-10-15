"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import SplitText from "@/components/motion/SplitText";
import Magnetic from "@/components/motion/Magnetic";
import { useIntroReady } from "@/components/motion/useIntroReady";
import Img from "@/components/site/Img";
import type { Hero as HeroData } from "@/lib/types";

const SLIDE_MS = 6000;

function Timecode() {
  const [t, setT] = useState("00:00:00:00");
  useEffect(() => {
    const start = performance.now();
    const id = setInterval(() => {
      const ms = performance.now() - start;
      const f = Math.floor((ms / (1000 / 24)) % 24);
      const s = Math.floor(ms / 1000);
      const pad = (n: number) => String(n).padStart(2, "0");
      setT(`${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(f)}`);
    }, 1000 / 24);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{t}</span>;
}

function RotatingWord({ words, ready }: { words: string[]; ready: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!ready || words.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % words.length), 2600);
    return () => clearInterval(id);
  }, [ready, words.length]);
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");
  return (
    <span className="relative inline-flex whitespace-nowrap pb-[0.1em] align-bottom [overflow:visible_clip]">
      <span className="invisible serif-i pr-[0.08em]">{longest}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[i]}
          className="serif-i absolute left-0 top-0 pr-[0.08em] text-accent"
          initial={{ y: ready ? "100%" : "110%", opacity: 0, filter: "blur(10px)" }}
          animate={ready ? { y: "0%", opacity: 1, filter: "blur(0px)" } : {}}
          exit={{ y: "-100%", opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: ready && i === 0 ? 0.35 : 0 }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Hero({ hero }: { hero: HeroData }) {
  const ready = useIntroReady();
  const ref = useRef<HTMLElement>(null);
  const [slide, setSlide] = useState(0);
  const slides = hero.slides?.length ? hero.slides : [];

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const frameInset = useTransform(scrollYProgress, [0, 1], ["0px", "28px"]);
  const radius = useTransform(scrollYProgress, [0, 1], ["0px", "36px"]);

  // autofocus square follows the pointer
  const fx = useMotionValue(0);
  const fy = useMotionValue(0);
  const sfx = useSpring(fx, { stiffness: 60, damping: 18 });
  const sfy = useSpring(fy, { stiffness: 60, damping: 18 });
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    setLocked(false);
    const t = setTimeout(() => setLocked(true), 900);
    return () => clearTimeout(t);
  }, [slide]);

  return (
    <section
      ref={ref}
      className="on-dark relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        fx.set((e.clientX - r.left - r.width / 2) * 0.35);
        fy.set((e.clientY - r.top - r.height / 2) * 0.35);
      }}
    >
      <motion.div className="absolute overflow-hidden" style={{ inset: frameInset, borderRadius: radius }}>
        <motion.div className="absolute inset-0" style={{ scale: bgScale }}>
          {hero.videoUrl ? (
            <video src={hero.videoUrl} autoPlay muted loop playsInline className="h-full w-full object-cover" />
          ) : (
            <AnimatePresence initial={false}>
              {slides.map(
                (src, i) =>
                  i === slide && (
                    <motion.div
                      key={src + i}
                      className="absolute inset-0"
                      initial={{ opacity: 0, clipPath: "inset(0 0 0 100%)" }}
                      animate={{ opacity: 1, clipPath: "inset(0 0 0 0%)" }}
                      exit={{ opacity: 0.6 }}
                      transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
                    >
                      <Img src={src} alt="" className="h-full w-full animate-kenburns object-cover" loading="eager" />
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          )}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,.6)_100%)]" />

        {/* Viewfinder overlay */}
        {hero.showViewfinder && (
          <motion.div
            className="pointer-events-none absolute inset-0 hidden font-mono text-[11px] uppercase tracking-[0.18em] text-white/80 sm:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ delay: 0.9, duration: 1 }}
          >
            {[
              "left-6 top-28 border-l border-t",
              "right-6 top-28 border-r border-t",
              "bottom-6 left-6 border-b border-l",
              "bottom-6 right-6 border-b border-r",
            ].map((c) => (
              <span key={c} className={`absolute h-10 w-10 border-paper/70 ${c}`} />
            ))}
            <div className="absolute left-20 top-[7.5rem] flex items-center gap-2">
              <span className="h-2 w-2 animate-blink rounded-full bg-red-500" /> REC <Timecode />
            </div>
            <div className="absolute right-20 top-[7.5rem] flex items-center gap-4">
              <span>4K · 24P</span>
              <span className="flex items-center gap-1">
                <span className="relative h-3 w-6 rounded-[3px] border border-paper/80 p-[2px]">
                  <span className="block h-full w-3/4 rounded-[1px] bg-paper/80" />
                </span>
              </span>
            </div>
            <div className="absolute bottom-16 left-20 flex gap-6">
              <span>ISO 400</span>
              <span>F1.8</span>
              <span>1/125</span>
              <span className="hidden md:inline">WB 5600K</span>
            </div>
            <div className="absolute bottom-16 right-20 flex gap-6">
              <span>{hero.location}</span>
              <span>
                FRAME {String(slide + 1).padStart(2, "0")}/{String(Math.max(slides.length, 1)).padStart(2, "0")}
              </span>
            </div>
            {/* exposure scale */}
            <div className="absolute bottom-[4.4rem] left-1/2 hidden -translate-x-1/2 items-end gap-[7px] lg:flex">
              {Array.from({ length: 25 }).map((_, i) => (
                <span key={i} className={`w-px bg-paper/70 ${i % 4 === 0 ? "h-3" : "h-1.5"} ${i === 12 ? "!h-4 !bg-accent" : ""}`} />
              ))}
            </div>
            {/* autofocus */}
            <motion.div className="absolute left-1/2 top-1/2" style={{ x: sfx, y: sfy }}>
              <motion.div
                className={`-translate-x-1/2 -translate-y-1/2 border transition-colors duration-300 ${locked ? "border-accent" : "border-paper/70"}`}
                animate={{ width: locked ? 74 : 110, height: locked ? 56 : 84 }}
                transition={{ type: "spring", stiffness: 260, damping: 14 }}
              >
                <span className={`absolute -top-5 left-0 text-[9px] ${locked ? "text-accent" : ""}`}>{locked ? "AF·LOCK" : "AF-C"}</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="container-x relative z-10 flex h-full flex-col justify-end pb-28 sm:pb-36">
        <motion.span className="eyebrow !text-white/70" initial={{ opacity: 0, y: 10 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1, duration: 0.8 }}>
          {hero.eyebrow}
        </motion.span>
        <h1 className="display mt-6 max-w-[16ch] text-[clamp(3rem,min(9vw,13svh),9.5rem)]">
          <span className="block">
            <SplitText text={hero.titleLine1} by="char" immediate={ready} delay={0.15} stagger={0.03} />
          </span>
          <span className="block">
            <RotatingWord words={hero.rotatingWords?.length ? hero.rotatingWords : ["light"]} ready={ready} />
          </span>
          <span className="block">
            <SplitText text={hero.titleLine2} immediate={ready} delay={0.55} wordClassName="text-gradient" />
          </span>
        </h1>
        <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <motion.p
            className="max-w-md text-[17px] leading-relaxed text-white/75"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.9, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {hero.subtitle}
          </motion.p>
          <motion.div
            className="flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.05, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Magnetic>
              <Link href={hero.primaryCtaHref || "/contact"} className="btn-accent">
                {hero.primaryCtaLabel} <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href={hero.secondaryCtaHref || "/work"} className="btn-ghost backdrop-blur-md">
                <Play className="h-3.5 w-3.5 fill-current" /> {hero.secondaryCtaLabel}
              </Link>
            </Magnetic>
          </motion.div>
        </div>

        {/* slide progress */}
        {slides.length > 1 && (
          <div className="mt-12 flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)} className="group h-6 flex-1 sm:max-w-[80px]" aria-label={`Show slide ${i + 1}`}>
                <span className="block h-[2px] w-full overflow-hidden rounded bg-paper/20">
                  {i === slide ? (
                    <motion.span key={slide} className="block h-full bg-white" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: SLIDE_MS / 1000, ease: "linear" }} />
                  ) : (
                    <span className={`block h-full bg-white ${i < slide ? "w-full" : "w-0"}`} />
                  )}
                </span>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60 sm:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ delay: 1.6 }}
      >
        <span className="relative block h-10 w-px overflow-hidden bg-paper/20">
          <motion.span className="absolute left-0 top-0 block h-1/2 w-full bg-white" animate={{ y: ["-100%", "200%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
        </span>
      </motion.div>
    </section>
  );
}
