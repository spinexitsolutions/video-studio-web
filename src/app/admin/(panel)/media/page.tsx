"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Loader2, Trash2, UploadCloud, X } from "lucide-react";
import type { Media } from "@/lib/types";
import { api, fmtBytes, timeAgo } from "@/components/admin/api";
import { useToast } from "@/components/admin/Toast";
import { useUpload } from "@/components/admin/MediaPicker";
import PageTitle from "@/components/admin/PageTitle";
import { inputCls } from "@/components/admin/Fields";
import { cn } from "@/lib/utils";

export default function MediaPage() {
  const toast = useToast();
  const { upload, uploading } = useUpload();
  const [items, setItems] = useState<Media[] | null>(null);
  const [over, setOver] = useState(false);
  const [sel, setSel] = useState<Media | null>(null);
  const [alt, setAlt] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<Media[]>("/api/admin/media").then(setItems).catch((e) => toast(e.message, "error"));
  }, [toast]);
  useEffect(() => setAlt(sel?.alt || ""), [sel]);

  const doUpload = async (files: FileList | File[]) => {
    const res = await upload(files);
    if (res.length) setItems((i) => [...res, ...(i || [])]);
  };

  return (
    <>
      <PageTitle title="Media library" description="Upload images and videos once, use them anywhere on the site.">
        <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-black">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />} Upload files
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,video/mp4,video/webm"
          className="hidden"
          onChange={(e) => {
            doUpload(e.target.files || []);
            e.target.value = "";
          }}
        />
      </PageTitle>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          doUpload(e.dataTransfer.files);
        }}
        className={cn("mb-6 grid place-items-center rounded-2xl border-2 border-dashed py-10 text-center text-sm transition", over ? "border-accent bg-accent/5" : "border-white/10 text-muted")}
      >
        <UploadCloud className="mb-2 h-7 w-7" strokeWidth={1.5} />
        Drag & drop images or videos here · JPG, PNG, WebP, AVIF, GIF, SVG, MP4 · up to 50 MB
      </div>

      {!items ? (
        <div className="grid h-40 place-items-center text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No files uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((m) => (
            <button key={m.id} onClick={() => setSel(m)} className={cn("group relative aspect-square overflow-hidden rounded-xl border-2 bg-white/5", sel?.id === m.id ? "border-accent" : "border-transparent")}>
              {m.mime.startsWith("video/") ? <video src={m.url} muted className="h-full w-full object-cover" /> : <img src={m.url} alt={m.alt} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />}
            </button>
          ))}
        </div>
      )}

      {sel && (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm overflow-y-auto border-l border-white/[0.07] bg-[#0e0e11] p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">File details</h3>
            <button onClick={() => setSel(null)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl bg-white/5">
            {sel.mime.startsWith("video/") ? <video src={sel.url} controls className="w-full" /> : <img src={sel.url} alt={sel.alt} className="w-full" />}
          </div>
          <dl className="mt-4 space-y-1 text-xs text-muted">
            <div>{sel.originalName}</div>
            <div>
              {fmtBytes(sel.size)} · {sel.mime} · {timeAgo(sel.createdAt)}
            </div>
          </dl>
          <label className="mt-5 block text-xs font-medium">URL</label>
          <div className="mt-1.5 flex gap-2">
            <input readOnly value={sel.url} className={cn(inputCls, "font-mono text-xs")} />
            <button
              onClick={() => {
                navigator.clipboard.writeText(sel.url);
                toast("URL copied");
              }}
              className="grid w-11 shrink-0 place-items-center rounded-xl bg-white/[0.06] hover:bg-white/10"
              aria-label="Copy URL"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <label className="mt-4 block text-xs font-medium">Alt text (accessibility & SEO)</label>
          <input value={alt} onChange={(e) => setAlt(e.target.value)} className={cn(inputCls, "mt-1.5")} />
          <div className="mt-5 flex gap-2">
            <button
              onClick={async () => {
                const u = await api<Media>(`/api/admin/media/${sel.id}`, { method: "PUT", json: { alt } });
                setItems((l) => l!.map((m) => (m.id === u.id ? u : m)));
                setSel(u);
                toast("Saved");
              }}
              className="flex-1 rounded-xl bg-paper py-2.5 text-sm font-medium text-black"
            >
              Save
            </button>
            <button
              onClick={async () => {
                if (!confirm("Delete this file? Pages using it will show a placeholder.")) return;
                await api(`/api/admin/media/${sel.id}`, { method: "DELETE" });
                setItems((l) => l!.filter((m) => m.id !== sel.id));
                setSel(null);
                toast("Deleted");
              }}
              className="grid w-11 place-items-center rounded-xl text-red-400 hover:bg-red-500/10"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
