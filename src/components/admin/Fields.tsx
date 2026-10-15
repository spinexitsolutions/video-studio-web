"use client";

import { marked } from "marked";
import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, ImagePlus, KeyRound, Plus, RefreshCw, Trash2, X } from "lucide-react";
import type { Field } from "@/lib/cms-schema";
import MediaPicker from "./MediaPicker";
import { cn } from "@/lib/utils";

export const inputCls =
  "w-full rounded-xl border border-paper/10 bg-paper/[0.03] px-4 py-2.5 text-[14px] outline-none transition placeholder:text-muted/60 focus:border-accent/70 focus:bg-paper/[0.05]";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-3">
      <span className={cn("relative h-6 w-11 rounded-full transition-colors duration-300", checked ? "bg-accent" : "bg-paper/15")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300", checked ? "left-[22px]" : "left-0.5")} />
      </span>
      {label && <span className="text-sm">{label}</span>}
    </button>
  );
}

function move<T>(arr: T[], from: number, to: number) {
  const a = [...arr];
  const [x] = a.splice(from, 1);
  a.splice(to, 0, x);
  return a;
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-start gap-4">
      <button type="button" onClick={() => setOpen(true)} className="group relative grid h-28 w-40 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-paper/15 bg-paper/[0.02] hover:border-accent">
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-muted group-hover:text-accent" />}
      </button>
      <div className="min-w-0 flex-1 space-y-2">
        <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="https://… or choose from library" className={inputCls} />
        <div className="flex gap-2">
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg bg-paper/[0.06] px-3 py-1.5 text-xs hover:bg-paper/10">
            Choose / upload
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="rounded-lg px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10">
              Remove
            </button>
          )}
        </div>
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} onSelect={(u) => onChange(u[0])} />
    </div>
  );
}

function GalleryField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const list = value || [];
  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {list.map((src, i) => (
          <div
            key={src + i}
            draggable
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (drag !== null && drag !== i) onChange(move(list, drag, i));
              setDrag(null);
            }}
            className={cn("group relative aspect-square cursor-grab overflow-hidden rounded-xl bg-paper/5", drag === i && "opacity-40")}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
            <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 text-[10px]">{i + 1}</span>
            <button type="button" onClick={() => onChange(list.filter((_, k) => k !== i))} className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/70 opacity-0 transition group-hover:opacity-100" aria-label="Remove">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setOpen(true)} className="grid aspect-square place-items-center rounded-xl border border-dashed border-paper/15 text-muted hover:border-accent hover:text-accent">
          <span className="flex flex-col items-center gap-1 text-xs">
            <ImagePlus className="h-5 w-5" /> Add
          </span>
        </button>
      </div>
      {list.length > 1 && <p className="mt-2 text-xs text-muted">Drag images to reorder.</p>}
      <MediaPicker open={open} multiple onClose={() => setOpen(false)} onSelect={(u) => onChange([...list, ...u])} />
    </div>
  );
}

function ListField({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const list = value || [];
  return (
    <div className="space-y-2">
      {list.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 shrink-0 text-muted/50" />
          <input value={v} onChange={(e) => onChange(list.map((x, k) => (k === i ? e.target.value : x)))} className={inputCls} placeholder={placeholder} />
          <button type="button" disabled={i === 0} onClick={() => onChange(move(list, i, i - 1))} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-paper/5 disabled:opacity-20" aria-label="Move up">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button type="button" disabled={i === list.length - 1} onClick={() => onChange(move(list, i, i + 1))} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-paper/5 disabled:opacity-20" aria-label="Move down">
            <ArrowDown className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onChange(list.filter((_, k) => k !== i))} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-red-400 hover:bg-red-500/10" aria-label="Remove">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...list, ""])} className="inline-flex items-center gap-1.5 rounded-lg bg-paper/[0.06] px-3 py-2 text-xs hover:bg-paper/10">
        <Plus className="h-3.5 w-3.5" /> Add item
      </button>
    </div>
  );
}

function TagsField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const list = value || [];
  const add = () => {
    const t = draft.trim();
    if (t && !list.includes(t)) onChange([...list, t]);
    setDraft("");
  };
  return (
    <div className={cn(inputCls, "flex flex-wrap items-center gap-2 py-2")}>
      {list.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-paper/10 px-2.5 py-1 text-xs">
          {t}
          <button type="button" onClick={() => onChange(list.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && list.length) onChange(list.slice(0, -1));
        }}
        onBlur={add}
        placeholder={list.length ? "" : "Type and press Enter"}
        className="min-w-[120px] flex-1 bg-transparent py-1 text-[14px] outline-none"
      />
    </div>
  );
}

function MarkdownField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-paper/10">
      <div className="flex items-center justify-between border-b border-paper/10 bg-paper/[0.03] px-3 py-2 text-xs text-muted">
        <span>Markdown · **bold** · *italic* · ## heading · - list · &gt; quote</span>
        <button type="button" onClick={() => setPreview((p) => !p)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-paper/10 hover:text-paper">
          {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {preview ? "Edit" : "Preview"}
        </button>
      </div>
      {preview ? (
        <div className="prose-studio min-h-[220px] px-5 py-3 !text-[15px]" dangerouslySetInnerHTML={{ __html: marked.parse(value || "", { async: false }) as string }} />
      ) : (
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={12} className="w-full resize-y bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed outline-none" />
      )}
    </div>
  );
}

function SectionsField({ value, onChange }: { value: { key: string; label: string; enabled: boolean }[]; onChange: (v: any[]) => void }) {
  const [drag, setDrag] = useState<number | null>(null);
  const list = value || [];
  return (
    <ul className="space-y-2">
      {list.map((s, i) => (
        <li
          key={s.key}
          draggable
          onDragStart={() => setDrag(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (drag !== null && drag !== i) onChange(move(list, drag, i));
            setDrag(null);
          }}
          className={cn("flex items-center gap-3 rounded-xl border border-paper/[0.07] bg-paper/[0.02] px-3 py-2.5", drag === i && "opacity-40", !s.enabled && "opacity-60")}
        >
          <GripVertical className="h-4 w-4 cursor-grab text-muted" />
          <span className="w-6 font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
          <span className="flex-1 text-sm">{s.label}</span>
          <button type="button" disabled={i === 0} onClick={() => onChange(move(list, i, i - 1))} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-paper/5 disabled:opacity-20" aria-label="Move up">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button type="button" disabled={i === list.length - 1} onClick={() => onChange(move(list, i, i + 1))} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-paper/5 disabled:opacity-20" aria-label="Move down">
            <ArrowDown className="h-4 w-4" />
          </button>
          <Toggle checked={s.enabled} onChange={(v) => onChange(list.map((x, k) => (k === i ? { ...x, enabled: v } : x)))} />
        </li>
      ))}
    </ul>
  );
}

function LineItemsField({ value, onChange }: { value: { description: string; qty: number; rate: number }[]; onChange: (v: any[]) => void }) {
  const list = value || [];
  const set = (i: number, patch: Record<string, any>) => onChange(list.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const subtotal = list.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0);
  return (
    <div className="space-y-2">
      <div className="hidden grid-cols-[1fr_80px_120px_110px_36px] gap-2 px-1 text-[11px] uppercase tracking-wider text-muted sm:grid">
        <span>Description</span>
        <span>Qty</span>
        <span>Rate</span>
        <span className="text-right">Amount</span>
        <span />
      </div>
      {list.map((it, i) => (
        <div key={i} className="grid grid-cols-[1fr_70px] gap-2 sm:grid-cols-[1fr_80px_120px_110px_36px]">
          <input value={it.description} onChange={(e) => set(i, { description: e.target.value })} placeholder="Item description" className={cn(inputCls, "col-span-2 sm:col-span-1")} />
          <input type="number" min={0} value={it.qty} onChange={(e) => set(i, { qty: Number(e.target.value) })} className={inputCls} />
          <input type="number" min={0} value={it.rate} onChange={(e) => set(i, { rate: Number(e.target.value) })} className={inputCls} />
          <span className="flex items-center justify-end text-sm tabular-nums text-paper/80">{((Number(it.qty) || 0) * (Number(it.rate) || 0)).toLocaleString()}</span>
          <button type="button" onClick={() => onChange(list.filter((_, k) => k !== i))} className="grid h-10 w-9 place-items-center rounded-lg text-red-400 hover:bg-red-500/10" aria-label="Remove line">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between pt-1">
        <button type="button" onClick={() => onChange([...list, { description: "", qty: 1, rate: 0 }])} className="inline-flex items-center gap-1.5 rounded-lg bg-paper/[0.06] px-3 py-2 text-xs hover:bg-paper/10">
          <Plus className="h-3.5 w-3.5" /> Add line
        </button>
        <span className="text-sm text-muted">
          Subtotal <span className="font-semibold tabular-nums text-paper">{subtotal.toLocaleString()}</span>
        </span>
      </div>
    </div>
  );
}

function ReadonlyField({ value }: { value: any }) {
  if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)) return <p className="text-sm text-muted">—</p>;
  if (typeof value === "string" && value.startsWith("data:image")) return <img src={value} alt="" className="h-24 rounded-lg bg-white p-2" />;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return <p className="text-sm">{new Date(value).toLocaleString()}</p>;
  if (Array.isArray(value) && value.every((v) => typeof v === "string" && /^(https?:|\/media\/)/.test(v)))
    return (
      <div>
        <p className="mb-2 text-xs text-muted">{value.length} photo(s)</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {value.map((v: string) => (
            <img key={v} src={v} alt="" className="aspect-square rounded-lg object-cover" />
          ))}
        </div>
      </div>
    );
  if (Array.isArray(value) && typeof value[0] === "object")
    return (
      <div className="overflow-x-auto rounded-xl border border-paper/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper/[0.04] text-[11px] uppercase tracking-wider text-muted">
            <tr>
              {Object.keys(value[0]).map((k) => (
                <th key={k} className="px-3 py-2 font-medium">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {value.map((row: any, i: number) => (
              <tr key={i} className="border-t border-paper/[0.06]">
                {Object.entries(row).map(([k, v]) => (
                  <td key={k} className="px-3 py-2">
                    {typeof v === "string" && /^(https?:|\/media\/)/.test(v) ? <img src={v} alt="" className="h-10 w-10 rounded object-cover" /> : String(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  return <p className="whitespace-pre-wrap rounded-xl bg-paper/[0.03] px-4 py-2.5 text-sm">{String(value)}</p>;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function FieldInput({ field, value, onChange, doc }: { field: Field; value: any; onChange: (v: any) => void; doc: Record<string, any> }) {
  switch (field.type) {
    case "textarea":
      return <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={4} className={cn(inputCls, "resize-y")} placeholder={field.placeholder} />;
    case "markdown":
      return <MarkdownField value={value} onChange={onChange} />;
    case "number":
      return <input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))} className={inputCls} placeholder={field.placeholder} />;
    case "boolean":
      return <Toggle checked={!!value} onChange={onChange} label={value ? "On" : "Off"} />;
    case "select":
      return (
        <select value={value || ""} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "appearance-none capitalize")}>
          {(field.options || []).map((o) => (
            <option key={o} value={o} className="bg-[#121215]">
              {o}
            </option>
          ))}
        </select>
      );
    case "color":
      return (
        <div className="flex items-center gap-3">
          <input type="color" value={value || "#ff7a45"} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer rounded-xl border border-paper/10 bg-transparent p-1" />
          <input value={value || ""} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "max-w-[160px] font-mono")} />
          <div className="flex gap-1.5">
            {["#ff7a45", "#2997ff", "#30d158", "#ffd60a", "#bf5af2", "#ff375f", "#f5f5f7"].map((c) => (
              <button key={c} type="button" onClick={() => onChange(c)} className="h-7 w-7 rounded-full border border-paper/20" style={{ background: c }} aria-label={c} />
            ))}
          </div>
        </div>
      );
    case "date":
      return <input type="date" value={value || ""} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "[color-scheme:dark]")} />;
    case "image":
      return <ImageField value={value} onChange={onChange} />;
    case "gallery":
      return <GalleryField value={value} onChange={onChange} />;
    case "list":
      return <ListField value={value} onChange={onChange} placeholder={field.placeholder} />;
    case "tags":
      return <TagsField value={value} onChange={onChange} />;
    case "sections":
      return <SectionsField value={value} onChange={onChange} />;
    case "lineItems":
      return <LineItemsField value={value} onChange={onChange} />;
    case "readonly":
      return <ReadonlyField value={value} />;
    case "weekdays":
      return (
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => {
            const on = (value || []).includes(d);
            return (
              <button key={d} type="button" onClick={() => onChange(on ? value.filter((x: string) => x !== d) : [...(value || []), d])} className={cn("rounded-lg border px-3 py-2 text-xs", on ? "border-red-400/50 bg-red-500/15 text-red-300" : "border-paper/10 text-paper/70 hover:border-paper/30")}>
                {on ? "Closed · " : ""}
                {d.slice(0, 3)}
              </button>
            );
          })}
        </div>
      );
    case "code":
      return (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input value={value || ""} onChange={(e) => onChange(e.target.value.toUpperCase().replace(/\s/g, ""))} className={cn(inputCls, "pl-9 font-mono tracking-[0.2em]")} />
          </div>
          <button
            type="button"
            onClick={() => onChange(Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join(""))}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-paper/[0.06] px-3 text-xs hover:bg-paper/10"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Generate
          </button>
        </div>
      );
    case "password":
      return <SecretInput value={value} onChange={onChange} />;
    case "slug":
      return (
        <div className="flex gap-2">
          <input value={value || ""} onChange={(e) => onChange(slugify(e.target.value))} className={cn(inputCls, "font-mono")} placeholder="auto-generated" />
          {field.from && (
            <button type="button" onClick={() => onChange(slugify(doc[field.from!] || ""))} className="shrink-0 rounded-xl bg-paper/[0.06] px-3 text-xs hover:bg-paper/10">
              Generate
            </button>
          )}
        </div>
      );
    default:
      return <input type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"} value={value || ""} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder={field.placeholder} />;
  }
}

function SecretInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  const masked = value === "••••••••";
  return (
    <div className="relative">
      <input
        type={show && !masked ? "text" : "password"}
        value={value || ""}
        onFocus={(e) => masked && e.currentTarget.select()}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Not set"
        autoComplete="new-password"
        className={cn(inputCls, "pr-10 font-mono")}
      />
      {!masked && value && (
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted hover:text-paper" aria-label="Show">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
      {masked && <p className="mt-1 text-[11px] text-emerald-400">Saved securely · type to replace</p>}
    </div>
  );
}
