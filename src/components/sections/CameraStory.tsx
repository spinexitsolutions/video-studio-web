"use client";

import dynamic from "next/dynamic";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { CameraFeature, Home } from "@/lib/types";
import SplitText from "@/components/motion/SplitText";

const CameraCanvas = dynamic(() => import("@/components/three/CameraCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-24 w-24 animate-spin-slow rounded-full border border-dashed border-white/20" />
    </div>
  ),
});

export default function CameraStory({ home, features, accent }: { home: Home; features: CameraFeature[]; accent: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const n = Math.max(features.length, 1);

  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(n - 1, Math.floor(v * n))));

  // only mount WebGL when near the viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: "100% 0px" });
    // pause rendering entirely while the section is off screen
    const io2 = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(el);
    io2.observe(el);
    return () => {
      io.disconnect();
      io2.disconnect();
    };
  }, []);

  const bgSpec = features[active]?.spec ?? "";
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [0.35, 0.7, 0.4]);
  const flash = useTransform(scrollYProgress, [0.95, 0.975, 1], [0, 0.5, 0]);

  return (
    <section ref={ref} className="relative bg-ink" style={{ height: `${(n + 1) * 100}vh` }} aria-label={home.cameraTitle}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* glow */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
          style={{ opacity: glow, background: `radial-gradient(circle, rgb(var(--accent-rgb) / .45), transparent 70%)` }}
        />
        {/* huge spec behind the camera */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          <motion.span
            key={bgSpec}
            initial={{ opacity: 0, scale: 0.85, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="select-none whitespace-nowrap text-[38vw] font-bold leading-none tracking-tightest text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,.07)] lg:text-[30vw]"
          >
            {bgSpec}
          </motion.span>
        </div>

        <div className="container-x relative grid h-full grid-rows-[auto_1fr_auto] py-24 lg:grid-cols-12 lg:grid-rows-1 lg:py-0">
          {/* heading */}
          <div className="z-10 lg:col-span-4 lg:flex lg:flex-col lg:justify-center">
            <span className="eyebrow">{home.cameraEyebrow}</span>
            <h2 className="display mt-4 text-[clamp(2.2rem,4.5vw,4rem)]">
              <SplitText text={home.cameraTitle} />
            </h2>
            <p className="mt-4 hidden text-muted lg:block">{home.cameraSubtitle}</p>

            {/* chapter list */}
            <ol className="mt-10 hidden space-y-3 lg:block">
              {features.map((f, i) => (
                <li key={f.id} className="flex items-center gap-4">
                  <span className="relative h-px w-10 overflow-hidden bg-white/15">
                    <motion.span className="absolute inset-0 origin-left bg-accent" animate={{ scaleX: i === active ? 1 : i < active ? 1 : 0, opacity: i === active ? 1 : 0.35 }} transition={{ duration: 0.6 }} />
                  </span>
                  <span className={`text-sm transition-colors duration-500 ${i === active ? "text-paper" : "text-muted"}`}>{f.title}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* 3D */}
          <div className="relative -mx-5 min-h-0 lg:col-span-5 lg:mx-0 lg:h-full">
            <div className="absolute inset-0 lg:-inset-x-[20%]">{visible && <CameraCanvas progress={scrollYProgress} accent={accent} active={onScreen} />}</div>
          </div>

          {/* feature text */}
          <div className="relative z-10 flex items-end lg:col-span-3 lg:items-center">
            <div className="relative h-[190px] w-full lg:h-[260px]">
              {features.map((f, i) => (
                <motion.div
                  key={f.id}
                  className="absolute inset-0"
                  initial={false}
                  animate={{ opacity: i === active ? 1 : 0, y: i === active ? 0 : i < active ? -30 : 30, filter: i === active ? "blur(0px)" : "blur(8px)" }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  aria-hidden={i !== active}
                >
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                    {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
                  </div>
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-5xl font-semibold tracking-tight text-accent lg:text-6xl">{f.spec}</span>
                    <span className="text-sm text-muted">{f.specLabel}</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-paper/65">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* progress rail */}
        <div className="absolute bottom-8 left-1/2 h-px w-40 -translate-x-1/2 bg-white/10">
          <motion.div className="h-full origin-left bg-accent" style={{ scaleX: scrollYProgress }} />
        </div>
        {/* shutter flash */}
        <motion.div className="pointer-events-none absolute inset-0 bg-white" style={{ opacity: flash }} />
      </div>
    </section>
  );
}
