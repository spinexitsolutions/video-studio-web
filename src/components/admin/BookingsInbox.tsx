"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Download, Inbox, Loader2, Mail, MapPin, Package, Phone, Search, Trash2, Wallet } from "lucide-react";
import type { Booking } from "@/lib/types";
import { api, timeAgo } from "./api";
import { useToast } from "./Toast";
import PageTitle from "./PageTitle";
import { BOOKING_STATUSES, StatusBadge } from "./StatusBadge";
import { downloadCsv } from "./csv";
import { inputCls } from "./Fields";
import { cn } from "@/lib/utils";

export default function BookingsInbox() {
  const toast = useToast();
  const params = useSearchParams();
  const [items, setItems] = useState<Booking[] | null>(null);
  const [active, setActive] = useState<string | null>(params.get("id"));
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");
  const [notes, setNotes] = useState("");
  const base = "/api/admin/collections/bookings";

  useEffect(() => {
    api<Booking[]>(base)
      .then((list) => {
        setItems(list);
        if (!params.get("id") && list[0] && window.innerWidth >= 1024) setActive(list[0].id);
      })
      .catch((e) => toast(e.message, "error"));
  }, [toast, params]);

  const list = useMemo(
    () => (items || []).filter((b) => (status === "all" || b.status === status) && (!q || `${b.name} ${b.email} ${b.service} ${b.message}`.toLowerCase().includes(q.toLowerCase()))),
    [items, status, q]
  );
  const current = items?.find((b) => b.id === active) || null;
  useEffect(() => setNotes(current?.notes || ""), [current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = async (id: string, data: Partial<Booking>, msg = "Updated") => {
    try {
      const updated = await api<Booking>(`${base}/${id}`, { method: "PUT", json: data });
      setItems((l) => l!.map((b) => (b.id === id ? updated : b)));
      toast(msg);
    } catch (e: any) {
      toast(e.message, "error");
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this enquiry?")) return;
    try {
      await api(`${base}/${id}`, { method: "DELETE" });
      setItems((l) => l!.filter((b) => b.id !== id));
      setActive(null);
      toast("Deleted");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const counts = Object.fromEntries(BOOKING_STATUSES.map((s) => [s, (items || []).filter((b) => b.status === s).length]));

  return (
    <>
      <PageTitle title="Bookings" description="Every enquiry from the website booking form.">
        <button
          onClick={() => downloadCsv(`bookings-${new Date().toISOString().slice(0, 10)}.csv`, items || [], ["createdAt", "status", "name", "email", "phone", "service", "package", "date", "location", "budget", "message", "notes"])}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:border-white/30"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </PageTitle>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/10 p-1 text-sm no-scrollbar">
          {["all", ...BOOKING_STATUSES].map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={cn("shrink-0 rounded-lg px-3 py-1.5 capitalize", status === s ? "bg-white/10 text-paper" : "text-muted hover:text-paper")}>
              {s} {s !== "all" && <span className="text-xs text-muted">{counts[s]}</span>}
            </button>
          ))}
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3">
          <Search className="h-4 w-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, message…" className="w-full bg-transparent py-2.5 text-sm outline-none" />
        </div>
      </div>

      {!items ? (
        <div className="grid h-64 place-items-center text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="grid h-72 place-items-center rounded-2xl border border-white/[0.07] bg-[#111114] text-center">
          <div>
            <Inbox className="mx-auto h-10 w-10 text-muted" strokeWidth={1.25} />
            <p className="mt-4 font-medium">Your inbox is empty</p>
            <p className="mt-1 text-sm text-muted">New bookings from the contact page will show up here.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <ul className={cn("max-h-[70vh] divide-y divide-white/[0.05] overflow-y-auto rounded-2xl border border-white/[0.07] bg-[#111114] lg:col-span-2", current && "hidden lg:block")}>
            {list.map((b) => (
              <li key={b.id}>
                <button onClick={() => setActive(b.id)} className={cn("w-full px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03]", active === b.id && "bg-white/[0.05]")}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("truncate text-sm", b.status === "new" ? "font-semibold" : "font-medium")}>{b.name}</span>
                    <span className="shrink-0 text-[11px] text-muted">{timeAgo(b.createdAt)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted">{b.service || "General enquiry"}</span>
                    <StatusBadge status={b.status} />
                  </div>
                </button>
              </li>
            ))}
            {list.length === 0 && <li className="p-8 text-center text-sm text-muted">No matches.</li>}
          </ul>

          {current ? (
            <section className="rounded-2xl border border-white/[0.07] bg-[#111114] lg:col-span-3">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] p-6">
                <div>
                  <button onClick={() => setActive(null)} className="mb-2 text-xs text-muted lg:hidden">
                    ← All bookings
                  </button>
                  <h2 className="text-xl font-semibold">{current.name}</h2>
                  <p className="text-sm text-muted">Received {new Date(current.createdAt).toLocaleString()}</p>
                </div>
                <select value={current.status} onChange={(e) => update(current.id, { status: e.target.value as any }, "Status updated")} className={cn(inputCls, "w-auto capitalize")}>
                  {BOOKING_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-[#121215]">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 p-6 sm:grid-cols-2">
                {[
                  { icon: Mail, label: "Email", value: current.email, href: `mailto:${current.email}` },
                  { icon: Phone, label: "Phone", value: current.phone, href: current.phone ? `tel:${current.phone}` : undefined },
                  { icon: Package, label: "Service / package", value: [current.service, current.package].filter(Boolean).join(" · ") },
                  { icon: Calendar, label: "Preferred date", value: current.date },
                  { icon: MapPin, label: "Location", value: current.location },
                  { icon: Wallet, label: "Budget", value: current.budget },
                ].map((r) => (
                  <div key={r.label} className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-4">
                    <r.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-muted">{r.label}</p>
                      {r.href && r.value ? (
                        <a href={r.href} className="block truncate text-sm text-accent">
                          {r.value}
                        </a>
                      ) : (
                        <p className="truncate text-sm">{r.value || "—"}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {current.message && (
                <div className="px-6">
                  <p className="text-[11px] uppercase tracking-wider text-muted">Message</p>
                  <p className="mt-2 whitespace-pre-wrap rounded-xl bg-white/[0.03] p-4 text-sm leading-relaxed">{current.message}</p>
                </div>
              )}
              <div className="p-6">
                <p className="text-[11px] uppercase tracking-wider text-muted">Internal notes</p>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Only visible to your team…" className={cn(inputCls, "mt-2 resize-y")} />
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button disabled={notes === (current.notes || "")} onClick={() => update(current.id, { notes }, "Notes saved")} className="rounded-xl bg-paper px-4 py-2.5 text-sm font-medium text-black disabled:opacity-40">
                    Save notes
                  </button>
                  <a
                    href={`mailto:${current.email}?subject=${encodeURIComponent(`Re: your ${current.service || "shoot"} enquiry`)}&body=${encodeURIComponent(`Hi ${current.name.split(" ")[0]},\n\nThank you for reaching out!\n\n`)}`}
                    onClick={() => current.status === "new" && update(current.id, { status: "contacted" }, "Marked as contacted")}
                    className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-black"
                  >
                    Reply by email
                  </a>
                  {current.phone && (
                    <a href={`https://wa.me/${current.phone.replace(/\D/g, "")}`} target="_blank" className="rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:border-white/30">
                      WhatsApp
                    </a>
                  )}
                  <button onClick={() => remove(current.id)} className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <div className="hidden place-items-center rounded-2xl border border-dashed border-white/[0.08] text-sm text-muted lg:col-span-3 lg:grid">Select an enquiry</div>
          )}
        </div>
      )}
    </>
  );
}
