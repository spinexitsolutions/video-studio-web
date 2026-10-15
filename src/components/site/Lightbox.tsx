"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function Lightbox({ images, index, onChange }: { images: string[]; index: number | null; onChange: (i: number | null) => void }) {
  const open = index !== null;
  const go = useCallback((d: number) => index !== null && onChange((index + d + images.length) % images.length), [index, images.length, onChange]);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onChange(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, go, onChange]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onChange(null)}
          data-lenis-prevent
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={index}
              src={images[index!]}
              alt=""
              className="max-h-[86vh] max-w-[92vw] rounded-lg object-contain"
              initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) go(1);
                if (info.offset.x > 80) go(-1);
              }}
            />
          </AnimatePresence>
          <div className="absolute left-1/2 top-6 -translate-x-1/2 font-mono text-xs tracking-[0.3em] text-white/60">
            {String(index! + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </div>
          <button onClick={() => onChange(null)} aria-label="Close" className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-white/10 hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label="Previous"
                className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label="Next"
                className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
