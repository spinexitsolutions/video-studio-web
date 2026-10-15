"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import type { FieldGroup } from "@/lib/cms-schema";
import { FieldInput } from "./Fields";
import { cn } from "@/lib/utils";

export default function DocForm({
  groups,
  initial,
  onSave,
  saveLabel = "Save changes",
  extraActions,
}: {
  groups: FieldGroup[];
  initial: Record<string, any>;
  onSave: (data: Record<string, any>) => Promise<void>;
  saveLabel?: string;
  extraActions?: React.ReactNode;
}) {
  const [doc, setDoc] = useState<Record<string, any>>(initial);
  const [base, setBase] = useState(JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dirty = useMemo(() => JSON.stringify(doc) !== base, [doc, base]);

  useEffect(() => {
    setDoc(initial);
    setBase(JSON.stringify(initial));
  }, [initial]);

  const save = async () => {
    const errs: Record<string, string> = {};
    groups.forEach((g) => g.fields.forEach((f) => f.required && (doc[f.name] === undefined || doc[f.name] === "" || doc[f.name] === null) && (errs[f.name] = `${f.label} is required`)));
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await onSave(doc);
      setBase(JSON.stringify(doc));
    } finally {
      setSaving(false);
    }
  };

  // ⌘S / Ctrl+S to save, warn before leaving with unsaved changes
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (!saving) save();
      }
    };
    const leave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", key);
    window.addEventListener("beforeunload", leave);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("beforeunload", leave);
    };
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="space-y-6 pb-24"
    >
      {groups.map((g) => (
        <section key={g.title} className="rounded-2xl border border-white/[0.07] bg-[#111114]">
          <div className="border-b border-white/[0.06] px-6 py-4">
            <h2 className="text-[15px] font-semibold">{g.title}</h2>
            {g.description && <p className="mt-0.5 text-xs text-muted">{g.description}</p>}
          </div>
          <div className="grid gap-x-6 gap-y-5 p-6 sm:grid-cols-2">
            {g.fields.map((f) => (
              <div key={f.name} className={cn(f.half ? "" : "sm:col-span-2")}>
                <label className="mb-2 flex items-center gap-1 text-[13px] font-medium text-paper/85">
                  {f.label}
                  {f.required && <span className="text-accent">*</span>}
                </label>
                <FieldInput field={f} value={doc[f.name]} doc={doc} onChange={(v) => setDoc((d) => ({ ...d, [f.name]: v }))} />
                {errors[f.name] ? <p className="mt-1.5 text-xs text-red-400">{errors[f.name]}</p> : f.help && <p className="mt-1.5 text-xs text-muted">{f.help}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.06] bg-[#0a0a0c]/85 backdrop-blur-xl lg:left-64">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <span className={cn("flex items-center gap-2 text-sm", dirty ? "text-amber-300" : "text-muted")}>
            <span className={cn("h-2 w-2 rounded-full", dirty ? "bg-amber-300" : "bg-emerald-400")} />
            {dirty ? "Unsaved changes" : "All changes saved"}
            <span className="hidden text-xs text-muted sm:inline">· ⌘S to save</span>
          </span>
          <div className="flex items-center gap-2">
            {extraActions}
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saveLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
