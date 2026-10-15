"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*+";

/** Decoding / scramble text effect, like a camera display booting up. */
export default function ScrambleText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [out, setOut] = useState(text.replace(/\S/g, " "));

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    let raf = 0;
    const total = text.length * 2 + 12;
    const start = performance.now() + delay * 1000;
    const tick = (t: number) => {
      if (t < start) {
        raf = requestAnimationFrame(tick);
        return;
      }
      frame++;
      const revealed = Math.floor((frame / total) * text.length * 1.2);
      setOut(
        text
          .split("")
          .map((c, i) => (c === " " ? " " : i < revealed ? c : CHARS[Math.floor(Math.random() * CHARS.length)]))
          .join("")
      );
      if (revealed < text.length) raf = requestAnimationFrame(tick);
      else setOut(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, text, delay]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {out}
    </span>
  );
}
