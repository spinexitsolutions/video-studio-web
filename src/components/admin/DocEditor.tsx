"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Loader2, Trash2 } from "lucide-react";
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
        {!isNew && doc && config.viewPath && doc.published !== false && (
          <a href={config.viewPath.replace("{slug}", doc.slug || "")} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:border-white/30">
            View live <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </PageTitle>
      {!doc ? (
        <div className="grid h-64 place-items-center text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <DocForm
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
