"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Copy, ExternalLink, GripVertical, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { CollectionConfig } from "@/lib/cms-schema";
import { api, timeAgo } from "./api";
import { useToast } from "./Toast";
import { Toggle } from "./Fields";
import PageTitle from "./PageTitle";
import { cn } from "@/lib/utils";

export default function CollectionList({ config }: { config: CollectionConfig }) {
  const toast = useToast();
  const [items, setItems] = useState<any[] | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [drag, setDrag] = useState<number | null>(null);
  const base = `/api/admin/collections/${config.key}`;

  useEffect(() => {
    api<any[]>(base)
      .then(setItems)
      .catch((e) => toast(e.message, "error"));
  }, [base, toast]);

  const visible = useMemo(() => {
    if (!items) return [];
    return items.filter((i) => {
      const text = JSON.stringify([i[config.titleField], i[config.subtitleField || ""]]).toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (filter === "published" && i.published === false) return false;
      if (filter === "draft" && i.published !== false) return false;
      return true;
    });
  }, [items, q, filter, config]);

  const canDrag = config.sortable && !q && filter === "all";

  const reorder = async (from: number, to: number) => {
    if (!items) return;
    const next = [...items];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    setItems(next);
    try {
      await api(`${base}/reorder`, { method: "POST", json: { ids: next.map((i) => i.id) } });
      toast("Order saved");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const togglePublished = async (item: any) => {
    const published = item.published === false;
    setItems((list) => list!.map((i) => (i.id === item.id ? { ...i, published } : i)));
    try {
      await api(`${base}/${item.id}`, { method: "PUT", json: { published } });
      toast(published ? "Published" : "Moved to drafts");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const duplicate = async (item: any) => {
    const { id: _id, createdAt: _c, updatedAt: _u, order: _o, ...rest } = item;
    try {
      const copy = await api(base, { method: "POST", json: { ...rest, [config.titleField]: `${item[config.titleField]} (copy)`, ...(rest.slug ? { slug: `${rest.slug}-copy` } : {}), published: false } });
      setItems((list) => [...list!, copy]);
      toast("Duplicated as a draft");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const remove = async (item: any) => {
    if (!confirm(`Delete “${item[config.titleField]}”? This can't be undone.`)) return;
    try {
      await api(`${base}/${item.id}`, { method: "DELETE" });
      setItems((list) => list!.filter((i) => i.id !== item.id));
      toast("Deleted");
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  return (
    <>
      <PageTitle title={config.label} description={config.description}>
        <Link href={`/admin/content/${config.key}/new`} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black hover:brightness-110">
          <Plus className="h-4 w-4" /> New {config.singular.toLowerCase()}
        </Link>
      </PageTitle>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3">
          <Search className="h-4 w-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${config.label.toLowerCase()}…`} className="w-full bg-transparent py-2.5 text-sm outline-none" />
        </div>
        {config.publishable && (
          <div className="flex rounded-xl border border-white/10 p-1 text-sm">
            {(["all", "published", "draft"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn("rounded-lg px-3 py-1.5 capitalize", filter === f ? "bg-white/10 text-paper" : "text-muted hover:text-paper")}>
                {f === "draft" ? "Drafts" : f}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111114]">
        {!items ? (
          <div className="grid h-48 place-items-center text-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : visible.length === 0 ? (
          <div className="grid h-48 place-items-center text-center text-sm text-muted">
            <div>
              <p>No {config.label.toLowerCase()} found.</p>
              <Link href={`/admin/content/${config.key}/new`} className="mt-3 inline-block text-accent">
                Create the first one →
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.05]">
            {visible.map((item, i) => (
              <li
                key={item.id}
                draggable={canDrag}
                onDragStart={() => setDrag(i)}
                onDragOver={(e) => canDrag && e.preventDefault()}
                onDrop={() => {
                  if (drag !== null && drag !== i) reorder(drag, i);
                  setDrag(null);
                }}
                className={cn("group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-white/[0.02]", drag === i && "opacity-40")}
              >
                {canDrag && <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted/50 group-hover:text-muted" />}
                {config.imageField && (
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                    {item[config.imageField] && <img src={item[config.imageField]} alt="" className="h-full w-full object-cover" loading="lazy" />}
                  </div>
                )}
                <Link href={`/admin/content/${config.key}/${item.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{item[config.titleField] || "Untitled"}</p>
                  <p className="truncate text-xs text-muted">
                    {config.subtitleField && item[config.subtitleField] ? `${item[config.subtitleField]} · ` : ""}
                    Updated {timeAgo(item.updatedAt)}
                  </p>
                </Link>
                {item.featured && <span className="hidden rounded-full bg-accent/15 px-2 py-0.5 text-[11px] text-accent sm:inline">Featured</span>}
                {config.publishable && (
                  <div className="hidden items-center gap-2 sm:flex" title={item.published === false ? "Draft" : "Published"}>
                    <Toggle checked={item.published !== false} onChange={() => togglePublished(item)} />
                  </div>
                )}
                <div className="flex items-center gap-1">
                  {config.viewPath && item.published !== false && (
                    <a href={config.viewPath.replace("{slug}", item.slug || "")} target="_blank" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-paper" title="View on site">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button onClick={() => duplicate(item)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-paper" title="Duplicate">
                    <Copy className="h-4 w-4" />
                  </button>
                  <Link href={`/admin/content/${config.key}/${item.id}`} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-paper" title="Edit">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button onClick={() => remove(item)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-400" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {canDrag && items && items.length > 1 && <p className="mt-3 text-xs text-muted">Tip: drag rows to change the order they appear on the website.</p>}
    </>
  );
}
