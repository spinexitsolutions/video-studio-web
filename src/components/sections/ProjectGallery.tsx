"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Img from "@/components/site/Img";
import Lightbox from "@/components/site/Lightbox";
import { cn } from "@/lib/utils";

export default function ProjectGallery({ images }: { images: string[] }) {
  const [index, setIndex] = useState<number | null>(null);
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-6">
        {images.map((src, i) => {
          // editorial rhythm: wide, two-up, tall + square...
          const pattern = ["col-span-2 lg:col-span-6 aspect-[16/8]", "lg:col-span-3 aspect-[4/5]", "lg:col-span-3 aspect-[4/5]", "col-span-2 lg:col-span-4 aspect-[3/2]", "col-span-2 lg:col-span-2 aspect-[3/4] lg:aspect-auto"];
          return (
            <motion.button
              key={src + i}
              onClick={() => setIndex(i)}
              className={cn("group relative overflow-hidden rounded-[calc(20px*var(--rs))] bg-ink-200", pattern[i % pattern.length])}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              data-cursor-label="Zoom"
              aria-label={`Open image ${i + 1}`}
            >
              <Img src={src} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-expo group-hover:scale-105" />
            </motion.button>
          );
        })}
      </div>
      <Lightbox images={images} index={index} onChange={setIndex} />
    </>
  );
}
