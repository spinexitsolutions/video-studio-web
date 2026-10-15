"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const blur = useTransform(progress, range, ["blur(6px)", "blur(0px)"]);
  return (
    <motion.span style={{ opacity, filter: blur }} className="inline-block">
      {children}&nbsp;
    </motion.span>
  );
}

/** Apple-style paragraph where words light up one-by-one as you scroll. */
export default function ScrollWords({ text, className, highlight = [] }: { text: string; className?: string; highlight?: string[] }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={cn("flex flex-wrap", className)}>
      {words.map((w, i) => {
        const start = i / words.length;
        const isHi = highlight.some((h) => w.toLowerCase().replace(/[^a-z]/g, "") === h);
        return (
          <span key={i} className={isHi ? "serif-i text-accent" : undefined}>
            <Word progress={scrollYProgress} range={[start, start + 1 / words.length]}>
              {w}
            </Word>
          </span>
        );
      })}
    </p>
  );
}
