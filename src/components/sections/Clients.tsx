"use client";

import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { useRef } from "react";
import type { Client } from "@/lib/types";
import Img from "@/components/site/Img";

function Row({ items, dir = 1, serif = false }: { items: Client[]; dir?: 1 | -1; serif?: boolean }) {
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-1000, 0, 1000], [-4, 0, 4], { clamp: false });
  const skew = useTransform(velocity, [-2000, 0, 2000], [-8, 0, 8]);
  const width = useRef(0);
  const inner = useRef<HTMLDivElement>(null);
  const direction = useRef(dir);

  useAnimationFrame((_, delta) => {
    if (!inner.current) return;
    width.current = inner.current.scrollWidth / 2;
    const f = factor.get();
    if (f < 0) direction.current = -dir as 1 | -1;
    else if (f > 0) direction.current = dir;
    let next = x.get() - direction.current * (delta / 1000) * 50 * (1 + Math.abs(f));
    if (next <= -width.current) next += width.current;
    if (next > 0) next -= width.current;
    x.set(next);
  });

  const list = [...items, ...items];
  return (
    <motion.div className="flex whitespace-nowrap" style={{ skewX: skew }}>
      <motion.div ref={inner} className="flex items-center" style={{ x }}>
        {list.map((c, i) => (
          <a
            key={i}
            href={c.url || undefined}
            target={c.url ? "_blank" : undefined}
            rel="noreferrer"
            className="group flex items-center"
            tabIndex={i >= items.length ? -1 : undefined}
          >
            {c.logo ? (
              <Img src={c.logo} alt={c.name} className="mx-10 h-10 w-auto opacity-60 grayscale transition group-hover:opacity-100 group-hover:grayscale-0" />
            ) : (
              <span
                className={`mx-8 text-[clamp(2rem,5vw,4.5rem)] tracking-tight text-paper/25 transition-colors duration-500 group-hover:text-paper ${
                  serif ? "serif-i" : "font-semibold"
                }`}
              >
                {c.name}
              </span>
            )}
            <span className="text-accent/60">✦</span>
          </a>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default function Clients({ clients }: { clients: Client[] }) {
  if (!clients.length) return null;
  const half = Math.ceil(clients.length / 2);
  return (
    <section className="relative overflow-hidden border-y border-white/[0.06] py-14">
      <p className="container-x mb-8 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Trusted by brands & families worldwide</p>
      <div className="space-y-2 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <Row items={clients.slice(0, half)} />
        <Row items={clients.slice(half).length ? clients.slice(half) : clients} dir={-1} serif />
      </div>
    </section>
  );
}
