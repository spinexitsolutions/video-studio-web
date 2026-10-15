"use client";

import { marked } from "marked";
import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, ImagePlus, Plus, Trash2, X } from "lucide-react";
import type { Field } from "@/lib/cms-schema";
import MediaPicker from "./MediaPicker";
import { cn } from "@/lib/utils";

export const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[14px] outline-none transition placeholder:text-muted/60 focus:border-accent/70 focus:bg-white/[0.05]";

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
      <span className={cn("relative h-6 w-11 rounded-full transition-colors duration-300", checked ? "bg-accent" : "bg-white/15")}>
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
      <button type="button" onClick={() => setOpen(true)} className="group relative grid h-28 w-40 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-white/[0.02] hover:border-accent">
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-muted group-hover:text-accent" />}
      </button>
      <div className="min-w-0 flex-1 space-y-2">
        <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="https://… or choose from library" className={inputCls} />
        <div className="flex gap-2">
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs hover:bg-white/10">
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
            className={cn("group relative aspect-square cursor-grab overflow-hidden rounded-xl bg-white/5", drag === i && "opacity-40")}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
            <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 text-[10px]">{i + 1}</span>
            <button type="button" onClick={() => onChange(list.filter((_, k) => k !== i))} className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/70 opacity-0 transition group-hover:opacity-100" aria-label="Remove">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setOpen(true)} className="grid aspect-square place-items-center rounded-xl border border-dashed border-white/15 text-muted hover:border-accent hover:text-accent">
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
          <button type="button" disabled={i === 0} onClick={() => onChange(move(list, i, i - 1))} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-white/5 disabled:opacity-20" aria-label="Move up">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button type="button" disabled={i === list.length - 1} onClick={() => onChange(move(list, i, i + 1))} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-white/5 disabled:opacity-20" aria-label="Move down">
            <ArrowDown className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onChange(list.filter((_, k) => k !== i))} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-red-400 hover:bg-red-500/10" aria-label="Remove">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...list, ""])} className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-2 text-xs hover:bg-white/10">
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
        <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs">
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
    <div className="overflow-hidden rounded-xl border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-muted">
        <span>Markdown · **bold** · *italic* · ## heading · - list · &gt; quote</span>
        <button type="button" onClick={() => setPreview((p) => !p)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-white/10 hover:text-paper">
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
          className={cn("flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5", drag === i && "opacity-40", !s.enabled && "opacity-60")}
        >
          <GripVertical className="h-4 w-4 cursor-grab text-muted" />
          <span className="w-6 font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
          <span className="flex-1 text-sm">{s.label}</span>
          <button type="button" disabled={i === 0} onClick={() => onChange(move(list, i, i - 1))} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-white/5 disabled:opacity-20" aria-label="Move up">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button type="button" disabled={i === list.length - 1} onClick={() => onChange(move(list, i, i + 1))} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-white/5 disabled:opacity-20" aria-label="Move down">
            <ArrowDown className="h-4 w-4" />
          </button>
          <Toggle checked={s.enabled} onChange={(v) => onChange(list.map((x, k) => (k === i ? { ...x, enabled: v } : x)))} />
        </li>
      ))}
    </ul>
  );
}

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
          <input type="color" value={value || "#ff7a45"} onChange={(e) => onChange(e.target.value)} className="h-11 w-14 cursor-pointer rounded-xl border border-white/10 bg-transparent p-1" />
          <input value={value || ""} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "max-w-[160px] font-mono")} />
          <div className="flex gap-1.5">
            {["#ff7a45", "#2997ff", "#30d158", "#ffd60a", "#bf5af2", "#ff375f", "#f5f5f7"].map((c) => (
              <button key={c} type="button" onClick={() => onChange(c)} className="h-7 w-7 rounded-full border border-white/20" style={{ background: c }} aria-label={c} />
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
    case "slug":
      return (
        <div className="flex gap-2">
          <input value={value || ""} onChange={(e) => onChange(slugify(e.target.value))} className={cn(inputCls, "font-mono")} placeholder="auto-generated" />
          {field.from && (
            <button type="button" onClick={() => onChange(slugify(doc[field.from!] || ""))} className="shrink-0 rounded-xl bg-white/[0.06] px-3 text-xs hover:bg-white/10">
              Generate
            </button>
          )}
        </div>
      );
    default:
      return <input type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"} value={value || ""} onChange={(e) => onChange(e.target.value)} className={inputCls} placeholder={field.placeholder} />;
  }
}
