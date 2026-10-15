"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import Img from "@/components/site/Img";
import Magnetic from "@/components/motion/Magnetic";
import SplitText from "@/components/motion/SplitText";

export default function Cta({ title, subtitle, image }: { title: string; subtitle: string; image: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.88, 1]);
  return (
    <section ref={ref} className="px-3 py-10 sm:px-6">
      <motion.div style={{ scale }} className="on-dark relative overflow-hidden rounded-[calc(36px*var(--rs))]">
        <motion.div style={{ y }} className="absolute inset-[-15%_0]">
          <Img src={image} alt="" className="h-full w-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
        <div className="container-x relative flex min-h-[80svh] flex-col justify-center py-24">
          <span className="eyebrow !text-white/70">Now booking</span>
          <h2 className="display mt-6 max-w-4xl text-[clamp(2.8rem,7vw,7rem)]">
            <SplitText text={title} />
          </h2>
          <p className="mt-6 max-w-lg text-lg text-white/75">{subtitle}</p>
          <div className="mt-10">
            <Magnetic strength={0.5}>
              <Link href="/contact" className="group relative grid h-40 w-40 place-items-center rounded-full bg-accent text-center text-on-accent transition-transform duration-700 ease-expo hover:scale-110 sm:h-48 sm:w-48">
                <span className="font-medium">
                  Book your
                  <br />
                  session
                </span>
                <ArrowUpRight className="absolute right-8 top-8 h-5 w-5 transition-transform duration-500 group-hover:rotate-45" />
              </Link>
            </Magnetic>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
