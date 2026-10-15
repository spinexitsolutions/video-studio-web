"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { parseVideo } from "@/lib/utils";

export default function VideoModal({ url, open, onClose }: { url: string; open: boolean; onClose: () => void }) {
  const video = parseVideo(url);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && video && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          data-lenis-prevent
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {video.type === "file" ? (
              <video src={video.src} autoPlay controls playsInline className="h-full w-full" />
            ) : (
              <iframe src={video.src} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen title="Video" />
            )}
          </motion.div>
          <button onClick={onClose} aria-label="Close" className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
