import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  new: "bg-accent/15 text-accent",
  contacted: "bg-sky-500/15 text-sky-300",
  confirmed: "bg-emerald-500/15 text-emerald-300",
  completed: "bg-paper/10 text-paper/80",
  cancelled: "bg-red-500/15 text-red-300",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize", styles[status] || styles.completed)}>{status}</span>;
}

export const BOOKING_STATUSES = ["new", "contacted", "confirmed", "completed", "cancelled"] as const;
