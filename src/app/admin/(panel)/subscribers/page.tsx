"use client";

import { useEffect, useState } from "react";
import { Copy, Download, Loader2, Mail, Trash2 } from "lucide-react";
import { api, timeAgo } from "@/components/admin/api";
import { useToast } from "@/components/admin/Toast";
import PageTitle from "@/components/admin/PageTitle";
import { downloadCsv } from "@/components/admin/csv";

export default function SubscribersPage() {
  const toast = useToast();
  const [items, setItems] = useState<any[] | null>(null);
  const [q, setQ] = useState("");
  useEffect(() => {
    api<any[]>("/api/admin/collections/subscribers").then(setItems).catch((e) => toast(e.message, "error"));
  }, [toast]);
  const list = (items || []).filter((s) => s.email.includes(q.toLowerCase()));
  return (
    <>
      <PageTitle title="Subscribers" description="People who joined your newsletter from the website footer.">
        <button
          onClick={() => {
            navigator.clipboard.writeText((items || []).map((s) => s.email).join(", "));
            toast("Emails copied to clipboard");
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:border-white/30"
        >
          <Copy className="h-4 w-4" /> Copy all
        </button>
        <button onClick={() => downloadCsv("subscribers.csv", items || [], ["email", "createdAt"])} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:border-white/30">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </PageTitle>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search emails…" className="mb-4 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm outline-none focus:border-accent/70" />
      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111114]">
        {!items ? (
          <div className="grid h-40 place-items-center text-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <div className="grid h-48 place-items-center text-center text-sm text-muted">
            <div>
              <Mail className="mx-auto mb-3 h-8 w-8" strokeWidth={1.25} />
              No subscribers yet.
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.05]">
            {list.map((s) => (
              <li key={s.id} className="flex items-center gap-4 px-5 py-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] text-xs">{s.email[0].toUpperCase()}</span>
                <a href={`mailto:${s.email}`} className="flex-1 truncate text-sm hover:text-accent">
                  {s.email}
                </a>
                <span className="text-xs text-muted">{timeAgo(s.createdAt)}</span>
                <button
                  onClick={async () => {
                    if (!confirm(`Remove ${s.email}?`)) return;
                    await api(`/api/admin/collections/subscribers/${s.id}`, { method: "DELETE" });
                    setItems((l) => l!.filter((x) => x.id !== s.id));
                    toast("Removed");
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-400"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {items && <p className="mt-3 text-xs text-muted">{items.length} subscriber{items.length === 1 ? "" : "s"}</p>}
    </>
  );
}
