"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { getSingletonConfig } from "@/lib/cms-schema";
import { api } from "./api";
import { useToast } from "./Toast";
import DocForm from "./DocForm";
import PageTitle from "./PageTitle";

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
          <a href={config.viewPath} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:border-white/30">
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
          onSave={async (data) => {
            try {
              const updated = await api(url, { method: "PUT", json: data });
              setDoc(updated);
              toast("Saved — the website is updated");
              if (singleton === "settings" && data.accentColor) {
                document.documentElement.style.setProperty("--accent", data.accentColor);
                const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(data.accentColor);
                if (m) document.documentElement.style.setProperty("--accent-rgb", `${parseInt(m[1], 16)} ${parseInt(m[2], 16)} ${parseInt(m[3], 16)}`);
              }
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
