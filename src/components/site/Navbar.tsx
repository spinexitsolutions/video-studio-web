"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Logo from "./Logo";
import Magnetic from "@/components/motion/Magnetic";
import { SocialLinks } from "./Social";
import type { Settings } from "@/lib/types";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "Studio" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar({ settings }: { settings: Settings }) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [announce, setAnnounce] = useState(Boolean(settings.announcement));

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > 400 && y > prev && !open);
  });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <AnimatePresence initial={false}>
          {announce && !scrolled && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden bg-accent text-black"
            >
              <div className="container-x flex items-center justify-center gap-3 py-2 pr-10 text-center text-[13px] font-medium">
                <Link href={settings.announcementLink || "/contact"} className="inline-flex items-center gap-1 hover:underline">
                  {settings.announcement} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <button onClick={() => setAnnounce(false)} aria-label="Dismiss" className="absolute right-4 text-black/60 hover:text-black">
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className={cn("transition-all duration-700 ease-expo", scrolled ? "pt-3" : "pt-5")}>
          <nav
            className={cn(
              "container-x flex items-center justify-between transition-all duration-700 ease-expo",
              scrolled && "max-w-[1100px]"
            )}
          >
            <div
              className={cn(
                "flex w-full items-center justify-between rounded-full py-2 pl-5 pr-2 transition-all duration-700 ease-expo",
                scrolled ? "glass shadow-[0_8px_40px_rgba(0,0,0,.35)]" : "border border-transparent"
              )}
            >
              <Logo text={settings.logoText} />
              <ul className="hidden items-center gap-1 lg:flex">
                {NAV.map((n) => {
                  const active = pathname === n.href || pathname.startsWith(n.href + "/");
                  return (
                    <li key={n.href}>
                      <Link
                        href={n.href}
                        className={cn(
                          "relative rounded-full px-4 py-2 text-[14px] transition-colors",
                          active ? "text-paper" : "text-paper/60 hover:text-paper"
                        )}
                      >
                        {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/[0.08]" transition={{ type: "spring", stiffness: 400, damping: 35 }} />}
                        <span className="relative">{n.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="flex items-center gap-2">
                <Magnetic className="hidden sm:block">
                  <Link href="/contact" className="btn-primary !py-2.5 !text-[14px]">
                    Book now <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Magnetic>
                <button
                  onClick={() => setOpen((o) => !o)}
                  aria-label="Menu"
                  aria-expanded={open}
                  className="relative grid h-11 w-11 place-items-center rounded-full bg-white/[0.08] lg:hidden"
                >
                  <span className={cn("absolute h-px w-5 bg-paper transition-all duration-500", open ? "rotate-45" : "-translate-y-1")} />
                  <span className={cn("absolute h-px w-5 bg-paper transition-all duration-500", open ? "-rotate-45" : "translate-y-1")} />
                </button>
              </div>
            </div>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-ink/95 backdrop-blur-2xl lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            data-lenis-prevent
          >
            <div className="container-x flex flex-1 flex-col justify-center pt-24">
              {NAV.map((n, i) => (
                <div key={n.href} className="overflow-hidden">
                  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ delay: 0.25 + i * 0.06, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                    <Link href={n.href} className="flex items-baseline gap-4 py-2 text-5xl font-semibold tracking-tight sm:text-6xl">
                      <span className="font-mono text-xs text-muted">0{i + 1}</span>
                      {n.label}
                    </Link>
                  </motion.div>
                </div>
              ))}
            </div>
            <motion.div className="container-x flex items-center justify-between pb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              <a href={`mailto:${settings.email}`} className="text-sm text-paper/70">
                {settings.email}
              </a>
              <SocialLinks settings={settings} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
