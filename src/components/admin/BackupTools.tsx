"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Upload } from "lucide-react";
import { api } from "./api";
import { useToast } from "./Toast";
import PageTitle from "./PageTitle";

export default function BackupTools() {
  const toast = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <PageTitle title="Backup & restore" description="Download all website content as a single JSON file, or restore from a previous backup." />
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-paper/[0.07] bg-[#111114] p-6">
          <Download className="h-6 w-6 text-accent" />
          <h2 className="mt-4 font-semibold">Download backup</h2>
          <p className="mt-1 text-sm text-muted">Includes every page, collection, booking and subscriber. Passwords are never included. Uploaded media files live in <code className="text-paper/80">data/uploads</code>.</p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page */}
          <a href="/api/admin/backup" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-paper px-4 py-2.5 text-sm font-medium text-ink">
            <Download className="h-4 w-4" /> Download .json
          </a>
        </section>
        <section className="rounded-2xl border border-paper/[0.07] bg-[#111114] p-6">
          <Upload className="h-6 w-6 text-accent" />
          <h2 className="mt-4 font-semibold">Restore from backup</h2>
          <p className="mt-1 text-sm text-muted">Replaces current content with the backup&apos;s content. User accounts are kept as they are.</p>
          <button onClick={() => ref.current?.click()} disabled={busy} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-paper/15 px-4 py-2.5 text-sm hover:border-paper/30">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Choose backup file
          </button>
          <input
            ref={ref}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file || !confirm("Restore this backup? Current content will be replaced.")) return;
              setBusy(true);
              try {
                await api("/api/admin/backup", { method: "POST", json: JSON.parse(await file.text()) });
                toast("Backup restored");
              } catch (err: any) {
                toast(err.message || "Invalid backup file", "error");
              } finally {
                setBusy(false);
              }
            }}
          />
        </section>
      </div>
    </>
  );
}
