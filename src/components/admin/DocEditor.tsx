"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, ExternalLink, Loader2, Send, Trash2 } from "lucide-react";
import { getCollectionConfig } from "@/lib/cms-schema";
import { api } from "./api";
import { useToast } from "./Toast";
import DocForm from "./DocForm";
import PageTitle from "./PageTitle";

export default function DocEditor({ collection, id }: { collection: string; id: string }) {
  const config = getCollectionConfig(collection)!;
  const router = useRouter();
  const toast = useToast();
  const isNew = id === "new";
  const [doc, setDoc] = useState<Record<string, any> | null>(isNew ? { ...config.defaults } : null);
  const base = `/api/admin/collections/${collection}`;

  useEffect(() => {
    if (isNew) return;
    api(`${base}/${id}`)
      .then(setDoc)
      .catch((e) => toast(e.message, "error"));
  }, [base, id, isNew, toast]);

  const save = async (data: Record<string, any>) => {
    try {
      if (isNew) {
        const created = await api(base, { method: "POST", json: data });
        toast(`${config.singular} created`);
        router.replace(`/admin/content/${collection}/${created.id}`);
      } else {
        const updated = await api(`${base}/${id}`, { method: "PUT", json: data });
        setDoc(updated);
        toast("Saved — the website is updated");
      }
    } catch (e: any) {
      toast(e.message, "error");
      throw e;
    }
  };

  const runAction = async (action: string) => {
    try {
      const r = await api(`/api/admin/actions/${collection}/${id}/${action}`, { method: "POST" });
      toast(r.message || "Done");
      setDoc(await api(`${base}/${id}`));
    } catch (e: any) {
      toast(e.message, "error");
    }
  };
  const publicLink = !isNew && doc && config.publicPath ? `${window.location.origin}${config.publicPath.replace("{slug}", doc.slug || "").replace("{token}", doc.token || "")}` : "";

  const remove = async () => {
    if (!confirm("Delete this item? This can't be undone.")) return;
    try {
      await api(`${base}/${id}`, { method: "DELETE" });
      toast("Deleted");
      router.push(`/admin/content/${collection}`);
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  return (
    <>
      <Link href={`/admin/content/${collection}`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-paper">
        <ArrowLeft className="h-4 w-4" /> {config.label}
      </Link>
      <PageTitle title={isNew ? `New ${config.singular.toLowerCase()}` : doc?.[config.titleField] || "Edit"} description={isNew ? config.description : undefined}>
        {config.actions?.map((a) =>
          !isNew && doc ? (
            <button key={a.key} onClick={() => runAction(a.key)} title={a.help} className="inline-flex items-center gap-2 rounded-xl bg-paper px-4 py-2.5 text-sm font-medium text-ink hover:opacity-90">
              <Send className="h-4 w-4" /> {a.label}
            </button>
          ) : null
        )}
        {!isNew && doc && config.viewPath && doc.published !== false && (
          <a href={config.viewPath.replace("{slug}", doc.slug || "")} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-paper/10 px-4 py-2.5 text-sm hover:border-paper/30">
            View live <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </PageTitle>
      {publicLink && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-accent/25 bg-accent/[0.06] p-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-accent">Client link</p>
            <p className="truncate font-mono text-sm">{publicLink}</p>
            {collection === "galleries" && doc?.accessCode && <p className="mt-1 text-xs text-muted">Access code: <span className="font-mono text-paper">{doc.accessCode}</span></p>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(collection === "galleries" ? `${publicLink}\nAccess code: ${doc?.accessCode}` : publicLink);
                toast("Link copied");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-paper/[0.08] px-3 py-2 text-sm hover:bg-paper/15"
            >
              <Copy className="h-4 w-4" /> Copy
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(collection === "galleries" ? `Your photos are ready! ${publicLink} (code: ${doc?.accessCode})` : publicLink)}`}
              target="_blank"
              className="inline-flex items-center rounded-xl bg-[#25D366] px-3 py-2 text-sm font-medium text-white"
            >
              WhatsApp
            </a>
            <a href={publicLink} target="_blank" className="inline-flex items-center gap-1.5 rounded-xl border border-paper/10 px-3 py-2 text-sm hover:border-paper/30">
              Open <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
      {!doc ? (
        <div className="grid h-64 place-items-center text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <DocForm
          readOnly={config.readOnly}
          groups={config.groups}
          initial={doc}
          onSave={save}
          saveLabel={isNew ? `Create ${config.singular.toLowerCase()}` : "Save changes"}
          extraActions={
            !isNew && (
              <button type="button" onClick={remove} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Delete</span>
              </button>
            )
          }
        />
      )}
    </>
  );
}
