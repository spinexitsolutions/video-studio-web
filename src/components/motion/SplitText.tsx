"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ElementType } from "react";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  wordClassName?: string;
  by?: "word" | "char";
  delay?: number;
  stagger?: number;
  once?: boolean;
  /** when provided, controls playback directly instead of waiting to be scrolled into view */
  immediate?: boolean;
}

/** Masked, staggered text reveal — every word (or letter) slides up from behind a mask. */
export default function SplitText({ text, as: Tag = "span", className, wordClassName, by = "word", delay = 0, stagger, once = true, immediate }: Props) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, margin: "0px 0px -10% 0px" });
  const show = immediate !== undefined ? immediate : inView;
  const words = text.split(" ");
  const step = stagger ?? (by === "char" ? 0.025 : 0.06);
  let index = 0;

  return (
    <Tag ref={ref} className={cn("inline", className)} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
          {by === "word" ? (
            <motion.span
              className={cn("inline-block will-change-transform", wordClassName)}
              initial={{ y: "110%", rotate: 4 }}
              animate={show ? { y: "0%", rotate: 0 } : { y: "110%", rotate: 4 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: delay + index++ * step }}
            >
              {word}
            </motion.span>
          ) : (
            word.split("").map((ch, ci) => (
              <motion.span
                key={ci}
                className={cn("inline-block will-change-transform", wordClassName)}
                initial={{ y: "110%" }}
                animate={show ? { y: "0%" } : { y: "110%" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: delay + index++ * step }}
              >
                {ch}
              </motion.span>
            ))
          )}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}
