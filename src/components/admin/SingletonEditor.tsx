"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { getSingletonConfig } from "@/lib/cms-schema";
import { api } from "./api";
import { useToast } from "./Toast";
import DocForm from "./DocForm";
import PageTitle from "./PageTitle";
import IntegrationsStatus from "./IntegrationsStatus";

export default function SingletonEditor({ singleton }: { singleton: string }) {
  const config = getSingletonConfig(singleton)!;
  const toast = useToast();
  const [doc, setDoc] = useState<Record<string, any> | null>(null);
  const url = `/api/admin/singletons/${singleton}`;

  useEffect(() => {
    api(url)
      .then(setDoc)
      .catch((e) => toast(e.message, "error"));
  }, [url, toast]);

  return (
    <>
      <PageTitle title={config.label} description={config.description}>
        {config.viewPath && (
          <a href={config.viewPath} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-paper/10 px-4 py-2.5 text-sm hover:border-paper/30">
            View live <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </PageTitle>
      {singleton === "integrations" && doc && <IntegrationsStatus doc={doc} />}
      {!doc ? (
        <div className="grid h-64 place-items-center text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <DocForm
          groups={config.groups}
          initial={doc}
          onSave={async (data) => {
            try {
              const updated = await api(url, { method: "PUT", json: data });
              setDoc(updated);
              toast("Saved — the website is updated");
            } catch (e: any) {
              toast(e.message, "error");
              throw e;
            }
          }}
        />
      )}
    </>
  );
}
