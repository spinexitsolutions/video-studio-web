"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { FOOTER_EXTRA, NAV } from "./Navbar";
import Newsletter from "./Newsletter";
import { SocialLinks } from "./Social";
import SplitText from "@/components/motion/SplitText";
import Magnetic from "@/components/motion/Magnetic";
import { scrollToTarget } from "@/components/motion/SmoothScroll";
import type { Settings } from "@/lib/types";

export default function Footer({ settings, legal = [], captcha }: { settings: Settings; legal?: { href: string; label: string }[]; captcha?: { provider: string; siteKey: string } }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-35%", "0%"]);
  const letterSpacing = useTransform(scrollYProgress, [0, 1], ["0.25em", "-0.04em"]);

  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-paper/[0.06] bg-ink">
      <div className="container-x pt-24 sm:pt-32">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="eyebrow">Get in touch</span>
            <h2 className="display mt-6 text-[clamp(2.6rem,6vw,5.5rem)]">
              <SplitText text={settings.footerHeadline} />
            </h2>
            <div className="mt-10 flex flex-wrap gap-3">
              <Magnetic>
                <Link href="/contact" className="btn-accent">
                  Start a project <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Magnetic>
              <a href={`mailto:${settings.email}`} className="btn-ghost">
                {settings.email}
              </a>
            </div>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <h3 className="text-lg font-medium">Join the newsletter</h3>
            <p className="mt-2 text-sm text-muted">Behind-the-scenes, lighting tips and first access to mini-session dates.</p>
            <div className="mt-6">
              <Newsletter captcha={captcha} />
            </div>
          </div>
        </div>

        <div className="mt-24 grid gap-10 border-t border-paper/[0.06] pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Studio</h4>
            <p className="mt-4 text-[15px] leading-relaxed text-paper/80">
              {settings.address}
              <br />
              {settings.city}
            </p>
            <p className="mt-2 text-sm text-muted">{settings.hours}</p>
          </div>
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Contact</h4>
            <a href={`mailto:${settings.email}`} className="mt-4 block text-[15px] text-paper/80 hover:text-accent">
              {settings.email}
            </a>
            <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="mt-1 block text-[15px] text-paper/80 hover:text-accent">
              {settings.phone}
            </a>
          </div>
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Explore</h4>
            <ul className="mt-4 grid grid-cols-2 gap-y-1 text-[15px]">
              {[...NAV, ...FOOTER_EXTRA].map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-paper/80 transition hover:text-accent">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Follow</h4>
            <SocialLinks settings={settings} className="mt-4 flex-wrap" />
          </div>
        </div>
      </div>

      <div className="relative mt-16 select-none overflow-hidden">
        <motion.div
          style={{ y, letterSpacing }}
          className="whitespace-nowrap text-center text-[23vw] font-bold leading-[0.8] tracking-tightest text-transparent [-webkit-text-stroke:1px_rgb(var(--paper)/0.16)]"
          aria-hidden
        >
          {settings.logoText}
        </motion.div>
      </div>

      <div className="container-x flex flex-col items-center justify-between gap-4 border-t border-paper/[0.06] py-6 text-xs text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {settings.copyright}
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          {legal.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-paper">
              {l.label}
            </Link>
          ))}
        </nav>
        <button onClick={() => scrollToTarget(0)} className="inline-flex items-center gap-2 hover:text-paper">
          Back to top <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </div>
    </footer>
  );
}
