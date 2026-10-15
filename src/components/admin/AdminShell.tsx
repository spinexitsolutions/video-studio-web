"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink, LogOut, Menu, X } from "lucide-react";
import { collections, singletons } from "@/lib/cms-schema";
import AdminIcon from "./AdminIcon";
import { ToastProvider } from "./Toast";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: string; badge?: number };

export default function AdminShell({
  user,
  siteName,
  newBookings,
  children,
}: {
  user: { name: string; email: string; role: string };
  siteName: string;
  newBookings: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const groups: { title: string; items: NavItem[] }[] = [
    {
      title: "Overview",
      items: [
        { href: "/admin", label: "Dashboard", icon: "dashboard" },
        { href: "/admin/bookings", label: "Bookings", icon: "calendar", badge: newBookings },
        { href: "/admin/subscribers", label: "Subscribers", icon: "mail" },
      ],
    },
    { title: "Pages", items: singletons.map((s) => ({ href: `/admin/pages/${s.key}`, label: s.label, icon: s.icon })) },
    { title: "Content", items: collections.map((c) => ({ href: `/admin/content/${c.key}`, label: c.label, icon: c.icon })) },
    {
      title: "System",
      items: [
        { href: "/admin/media", label: "Media library", icon: "media" },
        ...(user.role === "admin" ? [{ href: "/admin/users", label: "Users", icon: "users" }] : []),
        { href: "/admin/account", label: "My account", icon: "user" },
        ...(user.role === "admin" ? [{ href: "/admin/backup", label: "Backup & restore", icon: "database" }] : []),
      ],
    },
  ];

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-4 pt-6">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent text-black">
            <AdminIcon name="camera" className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold leading-tight">{siteName}</span>
            <span className="block text-[11px] text-muted">Studio CMS</span>
          </span>
        </Link>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-3 pb-6" data-lenis-prevent>
        {groups.map((g) => (
          <div key={g.title}>
            <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted/80">{g.title}</p>
            <ul className="space-y-0.5">
              {g.items.map((i) => {
                const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
                return (
                  <li key={i.href}>
                    <Link
                      href={i.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] transition-colors",
                        active ? "bg-white/[0.09] text-paper" : "text-paper/65 hover:bg-white/[0.04] hover:text-paper"
                      )}
                    >
                      <AdminIcon name={i.icon} className={cn("h-4 w-4", active && "text-accent")} />
                      <span className="flex-1">{i.label}</span>
                      {!!i.badge && <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-black">{i.badge}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent to-pink-500 text-sm font-semibold text-black">{user.name.slice(0, 1).toUpperCase()}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-[11px] capitalize text-muted">{user.role}</p>
          </div>
          <button onClick={logout} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-white/[0.06] hover:text-paper" title="Sign out" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#0a0a0c] text-paper">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/[0.06] bg-[#0e0e11] lg:block">{nav}</aside>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72 border-r border-white/[0.06] bg-[#0e0e11]">
              <button onClick={() => setOpen(false)} className="absolute right-3 top-5 grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10" aria-label="Close menu">
                <X className="h-4 w-4" />
              </button>
              {nav}
            </aside>
          </div>
        )}
        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#0a0a0c]/80 px-4 backdrop-blur-xl sm:px-8">
            <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-white/[0.06] lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden text-sm text-muted lg:block">Welcome back, {user.name.split(" ")[0]} 👋</div>
            <a href="/" target="_blank" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm transition hover:border-white/30">
              View website <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
