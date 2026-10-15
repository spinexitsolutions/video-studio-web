"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Avail = { unavailable: string[]; closedWeekdays: number[]; minDate: string };
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

/** Month calendar that greys out booked, blocked and closed days. */
export default function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [avail, setAvail] = useState<Avail | null>(null);
  const start = value ? new Date(`${value}T12:00:00`) : new Date();
  const [cursor, setCursor] = useState({ y: start.getFullYear(), m: start.getMonth() });

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.json())
      .then(setAvail)
      .catch(() => setAvail({ unavailable: [], closedWeekdays: [], minDate: new Date().toISOString().slice(0, 10) }));
  }, []);

  const days = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1).getDay();
    const count = new Date(cursor.y, cursor.m + 1, 0).getDate();
    return [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  }, [cursor]);

  const disabled = (d: string, wd: number) => !avail || d < avail.minDate || avail.unavailable.includes(d) || avail.closedWeekdays.includes(wd);
  const booked = (d: string) => !!avail?.unavailable.includes(d);
  const label = new Date(cursor.y, cursor.m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const move = (n: number) => setCursor(({ y, m }) => ({ y: m + n < 0 ? y - 1 : m + n > 11 ? y + 1 : y, m: (m + n + 12) % 12 }));
  const now = new Date();
  const canPrev = cursor.y > now.getFullYear() || (cursor.y === now.getFullYear() && cursor.m > now.getMonth());

  return (
    <div className="rounded-[calc(18px*var(--rs))] border border-paper/10 bg-paper/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" disabled={!canPrev} onClick={() => move(-1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper/10 disabled:opacity-25" aria-label="Previous month">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">{label}</span>
        <button type="button" onClick={() => move(1)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-paper/10" aria-label="Next month">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="py-1">
            {d}
          </span>
        ))}
        {days.map((d, i) => {
          if (!d) return <span key={i} />;
          const date = iso(cursor.y, cursor.m, d);
          const wd = (i % 7) as number;
          const off = disabled(date, wd);
          const sel = value === date;
          return (
            <button
              key={i}
              type="button"
              disabled={off}
              onClick={() => onChange(sel ? "" : date)}
              title={booked(date) ? "Booked" : off ? "Unavailable" : "Available"}
              className={cn(
                "relative aspect-square rounded-full text-[13px] transition",
                sel ? "bg-accent font-semibold text-on-accent" : off ? "cursor-not-allowed text-muted/40" : "text-paper hover:bg-paper/10",
                booked(date) && !sel && "line-through"
              )}
            >
              {d}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" /> Selected
        </span>
        <span className="line-through">12</span> Booked / unavailable
      </div>
    </div>
  );
}
