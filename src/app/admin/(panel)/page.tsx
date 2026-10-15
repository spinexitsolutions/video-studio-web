import Link from "next/link";
import { ArrowUpRight, CalendarCheck, Images, Mail, PenLine, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listDocs } from "@/lib/db";
import { collections } from "@/lib/cms-schema";
import type { Booking, CollectionKey } from "@/lib/types";
import AdminIcon from "@/components/admin/AdminIcon";
import { StatusBadge } from "@/components/admin/StatusBadge";

function weekBuckets(dates: string[], weeks = 12) {
  const now = Date.now();
  const week = 7 * 86400_000;
  const buckets = Array.from({ length: weeks }, (_, i) => ({ label: new Date(now - (weeks - 1 - i) * week).toLocaleDateString("en-US", { month: "short", day: "numeric" }), count: 0 }));
  for (const d of dates) {
    const age = Math.floor((now - new Date(d).getTime()) / week);
    if (age >= 0 && age < weeks) buckets[weeks - 1 - age].count++;
  }
  return buckets;
}

export default async function Dashboard() {
  const user = await getCurrentUser();
  const bookings = listDocs<Booking>("bookings", { sort: "newest" });
  const subscribers = listDocs("subscribers");
  const projects = listDocs("projects");
  const posts = listDocs("posts");
  const buckets = weekBuckets(bookings.map((b) => b.createdAt));
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const byStatus = ["new", "contacted", "confirmed", "completed", "cancelled"].map((s) => ({ s, n: bookings.filter((b) => b.status === s).length }));

  const cards = [
    { label: "New enquiries", value: bookings.filter((b) => b.status === "new").length, sub: `${bookings.length} total`, icon: CalendarCheck, href: "/admin/bookings" },
    { label: "Portfolio projects", value: projects.length, sub: `${projects.filter((p) => p.featured).length} featured`, icon: Images, href: "/admin/content/projects" },
    { label: "Subscribers", value: subscribers.length, sub: "newsletter list", icon: Mail, href: "/admin/subscribers" },
    { label: "Journal posts", value: posts.length, sub: `${posts.filter((p) => p.published === false).length} drafts`, icon: PenLine, href: "/admin/content/posts" },
  ];

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-tight">
            {greet}, {user?.name.split(" ")[0]}.
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/content/projects/new" className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black">
            <Plus className="h-4 w-4" /> New project
          </Link>
          <Link href="/admin/content/posts/new" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:border-white/30">
            <PenLine className="h-4 w-4" /> Write a post
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="group rounded-2xl border border-white/[0.07] bg-[#111114] p-5 transition hover:border-white/15">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] text-accent">
                <c.icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:rotate-45 group-hover:text-paper" />
            </div>
            <p className="mt-5 text-3xl font-semibold tracking-tight tabular-nums">{c.value}</p>
            <p className="mt-1 text-sm">{c.label}</p>
            <p className="text-xs text-muted">{c.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-white/[0.07] bg-[#111114] p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Enquiries · last 12 weeks</h2>
            <span className="text-xs text-muted">{buckets.reduce((a, b) => a + b.count, 0)} total</span>
          </div>
          <div className="mt-8 flex h-44 items-end gap-2">
            {buckets.map((b, i) => (
              <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[10px] text-muted opacity-0 transition group-hover:opacity-100">{b.count}</span>
                <div className="w-full rounded-md bg-gradient-to-t from-accent/40 to-accent transition-all group-hover:brightness-125" style={{ height: `${Math.max(3, (b.count / max) * 100)}%`, opacity: b.count ? 1 : 0.25 }} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            {buckets.map((b, i) => (
              <span key={i} className="flex-1 truncate text-center text-[10px] text-muted">
                {i % 2 === 0 ? b.label : ""}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.07] bg-[#111114] p-6">
          <h2 className="font-semibold">Pipeline</h2>
          <ul className="mt-6 space-y-4">
            {byStatus.map(({ s, n }) => (
              <li key={s}>
                <div className="flex items-center justify-between text-sm">
                  <StatusBadge status={s} />
                  <span className="tabular-nums text-muted">{n}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-paper/70" style={{ width: `${bookings.length ? (n / bookings.length) * 100 : 0}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-white/[0.07] bg-[#111114] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <h2 className="font-semibold">Latest enquiries</h2>
            <Link href="/admin/bookings" className="text-sm text-accent">
              View all
            </Link>
          </div>
          {bookings.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted">No enquiries yet. They&apos;ll appear here the moment someone books through the website.</p>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {bookings.slice(0, 6).map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/bookings?id=${b.id}`} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02]">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-sm font-medium">{b.name.slice(0, 1).toUpperCase()}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{b.name}</p>
                      <p className="truncate text-xs text-muted">
                        {b.service || "General"} {b.date ? `· ${b.date}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/[0.07] bg-[#111114] p-6">
          <h2 className="font-semibold">Content</h2>
          <ul className="mt-4 space-y-1">
            {collections.map((c) => (
              <li key={c.key}>
                <Link href={`/admin/content/${c.key}`} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-white/[0.04]">
                  <AdminIcon name={c.icon} className="h-4 w-4 text-muted" />
                  <span className="flex-1">{c.label}</span>
                  <span className="text-xs tabular-nums text-muted">{listDocs(c.key as CollectionKey).length}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
