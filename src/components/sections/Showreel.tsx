"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Play } from "lucide-react";
import Img from "@/components/site/Img";
import VideoModal from "@/components/site/VideoModal";

/** Poster grows from a small card to full-bleed as you scroll; the title splits apart. */
export default function Showreel({ title, subtitle, poster, videoUrl }: { title: string; subtitle: string; poster: string; videoUrl: string }) {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const clip = useTransform(scrollYProgress, [0.1, 0.75], ["inset(30% 32% 30% 32% round 32px)", "inset(0% 0% 0% 0% round 0px)"]);
  const scale = useTransform(scrollYProgress, [0.1, 0.8], [1.4, 1]);
  const leftX = useTransform(scrollYProgress, [0.1, 0.75], ["0%", "-60%"]);
  const rightX = useTransform(scrollYProgress, [0.1, 0.75], ["0%", "60%"]);
  const textOpacity = useTransform(scrollYProgress, [0.5, 0.75], [1, 0]);
  const playScale = useTransform(scrollYProgress, [0.55, 0.85], [0.6, 1]);
  const [first, ...rest] = title.split(" ");

  return (
    <section ref={ref} className="relative h-[220vh]">
      <div className="on-dark sticky top-0 h-[100svh] overflow-hidden">
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute inset-0 block w-full"
          style={{ clipPath: clip }}
          data-cursor-label="Play"
          aria-label={`Play ${title}`}
        >
          <motion.div className="absolute inset-0" style={{ scale }}>
            <Img src={poster} alt="" className="h-full w-full object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-black/35" />
          <motion.span style={{ scale: playScale }} className="absolute left-1/2 top-1/2 grid h-28 w-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper/15 backdrop-blur-xl sm:h-36 sm:w-36">
            <span className="absolute inset-0 animate-ping rounded-full bg-paper/10 [animation-duration:2.5s]" />
            <Play className="h-8 w-8 translate-x-0.5 fill-white text-white" />
          </motion.span>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">{subtitle}</p>
          </div>
        </motion.button>
        <motion.div style={{ opacity: textOpacity }} className="pointer-events-none absolute inset-0 flex items-center justify-center gap-[24vw] mix-blend-difference">
          <motion.span style={{ x: leftX }} className="text-[clamp(3rem,10vw,10rem)] font-semibold tracking-tightest">
            {first}
          </motion.span>
          <motion.span style={{ x: rightX }} className="serif-i text-[clamp(3rem,10vw,10rem)]">
            {rest.join(" ")}
          </motion.span>
        </motion.div>
      </div>
      <VideoModal url={videoUrl} open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
