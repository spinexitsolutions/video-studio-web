"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Link2, Loader2, Upload, X } from "lucide-react";
import { api } from "./api";
import type { Media } from "@/lib/types";
import { useToast } from "./Toast";
import { cn } from "@/lib/utils";

export function useUpload() {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const upload = useCallback(
    async (files: FileList | File[]): Promise<Media[]> => {
      const list = Array.from(files);
      if (!list.length) return [];
      setUploading(true);
      try {
        const fd = new FormData();
        list.forEach((f) => fd.append("file", f));
        const res = await api<Media[]>("/api/admin/media", { method: "POST", body: fd });
        toast(`Uploaded ${res.length} file${res.length > 1 ? "s" : ""}`);
        return res;
      } catch (e: any) {
        toast(e.message, "error");
        return [];
      } finally {
        setUploading(false);
      }
    },
    [toast]
  );
  return { upload, uploading };
}

export default function MediaPicker({ open, onClose, onSelect, multiple = false }: { open: boolean; onClose: () => void; onSelect: (urls: string[]) => void; multiple?: boolean }) {
  const [items, setItems] = useState<Media[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUpload();

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setLoading(true);
    api<Media[]>("/api/admin/media")
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const toggle = (u: string) => {
    if (!multiple) return setSelected([u]);
    setSelected((s) => (s.includes(u) ? s.filter((x) => x !== u) : [...s, u]));
  };
  const images = items.filter((m) => m.mime.startsWith("image/") || m.mime.startsWith("video/"));

  return createPortal(
    <div className="on-dark fixed inset-0 z-[150] flex items-center justify-center p-4" data-lenis-prevent>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-paper/10 bg-[#121215] shadow-2xl">
        <div className="flex items-center justify-between border-b border-paper/[0.07] px-6 py-4">
          <h3 className="font-semibold">Choose {multiple ? "images" : "an image"}</h3>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-paper/10" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-paper/[0.07] px-6 py-4">
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-on-accent">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,video/mp4,video/webm"
            className="hidden"
            onChange={async (e) => {
              const res = await upload(e.target.files || []);
              e.target.value = "";
              if (res.length) {
                setItems((i) => [...res, ...i]);
                setSelected((s) => (multiple ? [...s, ...res.map((r) => r.url)] : [res[0].url]));
              }
            }}
          />
          <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-xl border border-paper/10 bg-paper/[0.03] px-3">
            <Link2 className="h-4 w-4 text-muted" />
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an image URL" className="w-full bg-transparent py-2.5 text-sm outline-none" />
            <button
              disabled={!url}
              onClick={() => {
                onSelect([url.trim()]);
                setUrl("");
                onClose();
              }}
              className="text-sm font-medium text-accent disabled:opacity-30"
            >
              Use
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="grid h-40 place-items-center text-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : images.length === 0 ? (
            <div className="grid h-40 place-items-center text-center text-sm text-muted">No uploads yet — upload images or paste a URL above.</div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {images.map((m) => {
                const sel = selected.includes(m.url);
                return (
                  <button key={m.id} onClick={() => toggle(m.url)} className={cn("relative aspect-square overflow-hidden rounded-xl border-2 bg-paper/5", sel ? "border-accent" : "border-transparent")}>
                    {m.mime.startsWith("video/") ? <video src={m.url} className="h-full w-full object-cover" muted /> : <img src={m.url} alt={m.alt} className="h-full w-full object-cover" />}
                    {sel && (
                      <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-accent text-on-accent">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-paper/[0.07] px-6 py-4">
          <button onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm text-muted hover:text-paper">
            Cancel
          </button>
          <button
            disabled={!selected.length}
            onClick={() => {
              onSelect(selected);
              onClose();
            }}
            className="rounded-xl bg-paper px-5 py-2.5 text-sm font-medium text-ink disabled:opacity-40"
          >
            Insert {selected.length > 1 ? `${selected.length} images` : ""}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
