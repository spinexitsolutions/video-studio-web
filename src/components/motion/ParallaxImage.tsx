"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Img from "@/components/site/Img";
import { cn } from "@/lib/utils";

/** Image that drifts inside its frame as you scroll, revealed with a clip-path wipe. */
export default function ParallaxImage({ src, alt = "", className, amount = 12, reveal = true }: { src: string; alt?: string; className?: string; amount?: number; reveal?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);
  return (
    <motion.div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      initial={reveal ? { clipPath: "inset(12% 12% 12% 12% round 28px)" } : undefined}
      whileInView={reveal ? { clipPath: "inset(0% 0% 0% 0% round 0px)" } : undefined}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div style={{ y, scale: 1 + amount / 50 }} className="absolute inset-0">
        <Img src={src} alt={alt} className="h-full w-full object-cover" />
      </motion.div>
    </motion.div>
  );
}
