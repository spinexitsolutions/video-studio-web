import { getSingleton, listDocs } from "./db";
import type { Booking } from "./types";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const WEEKDAY_NAMES = WEEKDAYS;

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Dates (YYYY-MM-DD) that are fully booked or blocked. */
export function bookedCounts() {
  const counts: Record<string, number> = {};
  for (const b of listDocs<Booking>("bookings")) {
    if (!b.date) continue;
    if (b.status === "confirmed" || b.status === "completed" || b.paymentStatus === "deposit_paid") counts[b.date] = (counts[b.date] || 0) + 1;
  }
  return counts;
}

export function availability() {
  const cfg = getSingleton("booking");
  const counts = bookedCounts();
  const max = Math.max(1, Number(cfg.maxBookingsPerDay) || 1);
  const full = Object.entries(counts)
    .filter(([, n]) => n >= max)
    .map(([d]) => d);
  const min = new Date();
  min.setDate(min.getDate() + (Number(cfg.minNoticeDays) || 0));
  return {
    unavailable: Array.from(new Set([...(cfg.blockedDates || []), ...full])).sort(),
    closedWeekdays: (cfg.closedWeekdays || []).map((w) => WEEKDAYS.indexOf(w)).filter((n) => n >= 0),
    minDate: iso(min),
  };
}

export function isDateAvailable(date: string) {
  if (!date) return true;
  const a = availability();
  if (date < a.minDate) return false;
  if (a.unavailable.includes(date)) return false;
  const d = new Date(`${date}T12:00:00`);
  return !a.closedWeekdays.includes(d.getDay());
}
