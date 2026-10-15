"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

/** Aperture-blade intro with a counting exposure meter. Shown once per session. */
export default function Preloader({ name }: { name: string }) {
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("studio-intro") === "1";
      sessionStorage.setItem("studio-intro", "1");
    } catch {}
    if (seen) return;
    (window as any).__studioIntro = true;
    setShow(true);
    document.documentElement.style.overflow = "hidden";
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1900);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else
        setTimeout(() => {
          setShow(false);
          document.documentElement.style.overflow = "";
          (window as any).__studioIntro = false;
          window.dispatchEvent(new Event("studio:intro-done"));
        }, 350);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = "";
    };
  }, []);

  const blades = 8;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="on-dark fixed inset-0 z-[100] flex items-center justify-center bg-ink"
          exit={{ clipPath: "circle(0% at 50% 50%)" }}
          initial={{ clipPath: "circle(150% at 50% 50%)" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="relative flex flex-col items-center">
            <motion.svg viewBox="-50 -50 100 100" className="h-28 w-28" animate={{ rotate: count * 1.8 }} transition={{ ease: "linear", duration: 0.1 }}>
              <circle r="46" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1" />
              {Array.from({ length: blades }).map((_, i) => {
                const open = 1 - count / 100;
                return (
                  <g key={i} transform={`rotate(${(360 / blades) * i})`}>
                    <path
                      d={`M 0 -44 L ${18 + open * 20} -${10 + open * 22} L ${4 + open * 8} ${-2 - open * 8} Z`}
                      fill={i % 2 ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.08)"}
                      stroke="rgba(255,255,255,.25)"
                      strokeWidth=".5"
                    />
                  </g>
                );
              })}
              <circle r={4 + (count / 100) * 10} fill="var(--accent)" opacity={0.9} />
            </motion.svg>
            <div className="mt-10 flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted">
              <span>{name}</span>
              <span className="text-paper tabular-nums">{String(count).padStart(3, "0")}</span>
            </div>
            <div className="mt-4 h-px w-48 overflow-hidden bg-paper/10">
              <div className="h-full bg-accent" style={{ width: `${count}%` }} />
            </div>
          </div>
          <div className="absolute bottom-8 left-8 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">ISO 100 · f/1.4 · 1/250</div>
          <div className="absolute bottom-8 right-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-red-500" /> Loading
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
