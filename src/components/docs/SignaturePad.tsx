"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Eraser } from "lucide-react";

export interface SignatureHandle {
  toDataURL: () => string;
  isEmpty: () => boolean;
}

/** Smooth canvas signature pad (mouse, touch & pen). */
const SignaturePad = forwardRef<SignatureHandle>(function SignaturePad(_, ref) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const c = canvas.current!;
    const resize = () => {
      const r = c.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      c.width = r.width * dpr;
      c.height = r.height * dpr;
      const ctx = c.getContext("2d")!;
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = "#111";
      setEmpty(true);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useImperativeHandle(ref, () => ({ toDataURL: () => canvas.current!.toDataURL("image/png"), isEmpty: () => empty }));

  const pos = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <div className="relative">
      <canvas
        ref={canvas}
        className="h-44 w-full touch-none rounded-[calc(16px*var(--rs))] bg-white"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          drawing.current = true;
          last.current = pos(e);
        }}
        onPointerMove={(e) => {
          if (!drawing.current || !last.current) return;
          const p = pos(e);
          const ctx = canvas.current!.getContext("2d")!;
          ctx.beginPath();
          ctx.moveTo(last.current.x, last.current.y);
          ctx.quadraticCurveTo(last.current.x, last.current.y, (p.x + last.current.x) / 2, (p.y + last.current.y) / 2);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          last.current = p;
          setEmpty(false);
        }}
        onPointerUp={() => {
          drawing.current = false;
          last.current = null;
        }}
        aria-label="Draw your signature"
      />
      {empty && <span className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-zinc-400">Sign here with your finger or mouse</span>}
      <button
        type="button"
        onClick={() => {
          const c = canvas.current!;
          c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
          setEmpty(true);
        }}
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-200"
      >
        <Eraser className="h-3.5 w-3.5" /> Clear
      </button>
      <span className="pointer-events-none absolute bottom-8 left-6 right-6 border-b border-dashed border-zinc-300" />
    </div>
  );
});

export default SignaturePad;
