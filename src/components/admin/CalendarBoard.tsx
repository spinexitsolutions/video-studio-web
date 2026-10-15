"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Ban, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { Booking } from "@/lib/types";
import { api } from "./api";
import { useToast } from "./Toast";
import PageTitle from "./PageTitle";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarBoard() {
  const toast = useToast();
  const now = new Date();
  const [cur, setCur] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [cfg, setCfg] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    Promise.all([api<Booking[]>("/api/admin/collections/bookings"), api("/api/admin/singletons/booking")])
      .then(([b, c]) => {
        setBookings(b);
        setCfg(c);
      })
      .catch((e) => toast(e.message, "error"));
  }, [toast]);

  const byDate = useMemo(() => {
    const m: Record<string, Booking[]> = {};
    for (const b of bookings || []) if (b.date && b.status !== "cancelled") (m[b.date] ||= []).push(b);
    return m;
  }, [bookings]);

  const cells = useMemo(() => {
    const first = new Date(cur.y, cur.m, 1).getDay();
    const count = new Date(cur.y, cur.m + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  }, [cur]);

  const blocked: string[] = cfg?.blockedDates || [];
  const closed: string[] = cfg?.closedWeekdays || [];
  const toggleBlock = async (date: string) => {
    const next = blocked.includes(date) ? blocked.filter((d) => d !== date) : [...blocked, date].sort();
    setCfg((c) => ({ ...c!, blockedDates: next }));
    try {
      await api("/api/admin/singletons/booking", { method: "PUT", json: { blockedDates: next } });
      toast(blocked.includes(date) ? `${date} is open again` : `${date} blocked`);
    } catch (e: any) {
      toast(e.message, "error");
    }
  };
  const move = (n: number) => setCur(({ y, m }) => ({ y: m + n < 0 ? y - 1 : m + n > 11 ? y + 1 : y, m: (m + n + 12) % 12 }));
  const today = iso(now.getFullYear(), now.getMonth(), now.getDate());
  const upcoming = (bookings || []).filter((b) => b.date >= today && b.status !== "cancelled").sort((a, b) => (a.date > b.date ? 1 : -1)).slice(0, 8);

  return (
    <>
      <PageTitle title="Calendar" description="See every booking by date. Click an empty day to block or unblock it on the website's booking calendar." />
      {!bookings || !cfg ? (
        <div className="grid h-64 place-items-center text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-4">
          <section className="rounded-2xl border border-paper/[0.07] bg-[#111114] p-4 sm:p-6 lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{new Date(cur.y, cur.m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
              <div className="flex gap-1">
                <button onClick={() => setCur({ y: now.getFullYear(), m: now.getMonth() })} className="rounded-lg px-3 text-sm text-muted hover:bg-paper/5 hover:text-paper">
                  Today
                </button>
                <button onClick={() => move(-1)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-paper/5" aria-label="Previous">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => move(1)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-paper/5" aria-label="Next">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map((d) => (
                <span key={d} className="pb-1 text-center text-[11px] uppercase tracking-wider text-muted">
                  {d}
                </span>
              ))}
              {cells.map((d, i) => {
                if (!d) return <span key={i} />;
                const date = iso(cur.y, cur.m, d);
                const list = byDate[date] || [];
                const isBlocked = blocked.includes(date);
                const isClosed = closed.includes(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][i % 7]);
                return (
                  <div
                    key={i}
                    onClick={() => !list.length && toggleBlock(date)}
                    className={cn(
                      "group min-h-[92px] rounded-xl border p-1.5 text-left transition",
                      list.length ? "border-paper/10 bg-paper/[0.03]" : "cursor-pointer border-paper/[0.05] hover:border-paper/20",
                      isBlocked && "border-red-500/30 bg-[repeating-linear-gradient(135deg,rgba(239,68,68,.08)_0_6px,transparent_6px_12px)]",
                      isClosed && !list.length && "opacity-50",
                      date < today && "opacity-40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn("grid h-6 w-6 place-items-center rounded-full text-xs", date === today && "bg-accent font-semibold text-on-accent")}>{d}</span>
                      {isBlocked && <Ban className="h-3.5 w-3.5 text-red-400" />}
                    </div>
                    <div className="mt-1 space-y-1">
                      {list.slice(0, 3).map((b) => (
                        <Link key={b.id} href={`/admin/bookings?id=${b.id}`} onClick={(e) => e.stopPropagation()} className={cn("block truncate rounded-md px-1.5 py-0.5 text-[11px]", b.status === "confirmed" || b.paymentStatus === "deposit_paid" ? "bg-emerald-500/20 text-emerald-200" : "bg-accent/20 text-accent")}>
                          {b.name}
                        </Link>
                      ))}
                      {list.length > 3 && <span className="text-[10px] text-muted">+{list.length - 3} more</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-emerald-500/40" /> Confirmed / deposit paid</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-accent/40" /> Enquiry</span>
              <span className="flex items-center gap-1.5"><Ban className="h-3 w-3 text-red-400" /> Blocked (click to unblock)</span>
            </div>
          </section>
          <section className="rounded-2xl border border-paper/[0.07] bg-[#111114] p-5">
            <h3 className="font-semibold">Upcoming</h3>
            {upcoming.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No upcoming bookings.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {upcoming.map((b) => (
                  <li key={b.id}>
                    <Link href={`/admin/bookings?id=${b.id}`} className="block rounded-xl bg-paper/[0.03] p-3 hover:bg-paper/[0.06]">
                      <p className="text-xs text-muted">{new Date(`${b.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                      <p className="mt-0.5 truncate text-sm font-medium">{b.name}</p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-muted">{b.service}</span>
                        <StatusBadge status={b.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
