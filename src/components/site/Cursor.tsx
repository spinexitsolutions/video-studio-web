"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * A focus-ring cursor. Elements can opt in to states with data attributes:
 *  data-cursor="hover"          → ring grows
 *  data-cursor-label="View"     → ring fills and shows a label
 */
export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<"default" | "hover" | "label">("default");
  const [label, setLabel] = useState("");
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = (e.target as HTMLElement)?.closest?.("[data-cursor-label], [data-cursor], a, button") as HTMLElement | null;
      if (el?.dataset.cursorLabel) {
        setMode("label");
        setLabel(el.dataset.cursorLabel);
      } else if (el) setMode("hover");
      else setMode("default");
    };
    const d = () => setDown(true);
    const u = () => setDown(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", d);
    window.addEventListener("pointerup", u);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", d);
      window.removeEventListener("pointerup", u);
    };
  }, [x, y]);

  if (!enabled) return null;
  const size = mode === "label" ? 92 : mode === "hover" ? 56 : 26;

  return (
    <>
      <motion.div className="pointer-events-none fixed left-0 top-0 z-[90] mix-blend-difference" style={{ x, y }}>
        <div className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      </motion.div>
      <motion.div className="pointer-events-none fixed left-0 top-0 z-[89]" style={{ x: sx, y: sy }}>
        <motion.div
          className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ${
            mode === "label" ? "bg-accent text-black" : "border border-white/50 mix-blend-difference"
          }`}
          animate={{ width: size, height: size, scale: down ? 0.85 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {mode === "label" && <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em]">{label}</span>}
          {mode === "default" && (
            <>
              <span className="absolute left-1/2 top-0 h-1.5 w-px -translate-x-1/2 bg-white/60" />
              <span className="absolute bottom-0 left-1/2 h-1.5 w-px -translate-x-1/2 bg-white/60" />
            </>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
