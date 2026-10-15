"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { MoveHorizontal } from "lucide-react";
import Img from "@/components/site/Img";
import SectionHeading from "./SectionHeading";

const RAW_FILTER = "grayscale(.35) contrast(.72) brightness(1.12) saturate(.55) sepia(.08)";

export default function Retouch({ title, subtitle, before, after, index }: { title: string; subtitle: string; before: string; after: string; index?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const pos = useMotionValue(50);
  const clip = useTransform(pos, (v) => `inset(0 ${100 - v}% 0 0)`);
  const left = useTransform(pos, (v) => `${v}%`);

  // gentle intro sweep
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          animate(pos, [50, 18, 78, 50], { duration: 2.4, ease: "easeInOut" });
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [pos]);

  const move = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    pos.set(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <section className="py-28 sm:py-40">
      <div className="container-x">
        <SectionHeading eyebrow="Post-production" title={title} subtitle={subtitle} index={index} />
        <div
          ref={box}
          className="on-dark relative mt-14 aspect-[4/5] touch-pan-y select-none overflow-hidden rounded-[calc(28px*var(--rs))] sm:aspect-[16/9]"
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            move(e.clientX);
          }}
          onPointerMove={(e) => e.buttons === 1 && move(e.clientX)}
          data-cursor-label="Drag"
        >
          {/* edited */}
          <Img src={after} alt="Edited" className="absolute inset-0 h-full w-full object-cover" />
          {/* raw */}
          <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
            <Img src={before || after} alt="RAW" className="h-full w-full object-cover" style={before ? undefined : { filter: RAW_FILTER }} />
          </motion.div>
          <span className="absolute left-5 top-5 rounded-full bg-black/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur-md">RAW · Unedited</span>
          <span className="absolute right-5 top-5 rounded-full bg-accent px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-on-accent">Graded · Final</span>
          <motion.div className="absolute inset-y-0 w-px -translate-x-1/2 bg-white" style={{ left }}>
            <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-black shadow-2xl">
              <MoveHorizontal className="h-5 w-5" />
            </span>
          </motion.div>
          <input
            type="range"
            min={0}
            max={100}
            defaultValue={50}
            aria-label="Compare before and after"
            onChange={(e) => pos.set(Number(e.target.value))}
            className="absolute inset-x-0 bottom-0 h-0 w-full opacity-0 focus:h-8 focus:opacity-100"
          />
        </div>
      </div>
    </section>
  );
}
