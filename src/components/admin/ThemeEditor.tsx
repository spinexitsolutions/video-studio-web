"use client";

import { useEffect, useState } from "react";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { getSingletonConfig } from "@/lib/cms-schema";
import { THEMES, themeVars } from "@/lib/themes";
import { api } from "./api";
import { useToast } from "./Toast";
import DocForm from "./DocForm";
import PageTitle from "./PageTitle";
import { cn } from "@/lib/utils";

const rgb = (t: string) => `rgb(${t})`;

export default function ThemeEditor() {
  const config = getSingletonConfig("theme")!;
  const toast = useToast();
  const [doc, setDoc] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    api("/api/admin/singletons/theme").then(setDoc).catch((e) => toast(e.message, "error"));
  }, [toast]);

  const save = async (data: Record<string, any>) => {
    try {
      const updated = await api("/api/admin/singletons/theme", { method: "PUT", json: data });
      setDoc(updated);
      // apply the accent instantly in the admin too
      const { vars } = themeVars(updated);
      document.documentElement.style.setProperty("--accent", vars["--accent"]);
      document.documentElement.style.setProperty("--accent-rgb", vars["--accent-rgb"]);
      document.documentElement.style.setProperty("--on-accent", vars["--on-accent"]);
      toast("Theme saved — refresh the website to see it");
    } catch (e: any) {
      toast(e.message, "error");
      throw e;
    }
  };

  return (
    <>
      <PageTitle title="Theme" description="Pick a look for the whole website, then fine-tune colours, fonts and corners.">
        <a href="/" target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-paper/10 px-4 py-2.5 text-sm hover:border-paper/30">
          Preview site <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </PageTitle>
      {!doc ? (
        <div className="grid h-64 place-items-center text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(THEMES).map(([key, t]) => {
              const active = doc.preset === key;
              return (
                <button
                  key={key}
                  onClick={() => save({ ...doc, preset: key, accent: t.accent })}
                  className={cn("group overflow-hidden rounded-2xl border-2 text-left transition", active ? "border-accent" : "border-paper/[0.07] hover:border-paper/25")}
                >
                  <div className="relative h-32 p-4" style={{ background: rgb(t.ink[0]), color: rgb(t.paper) }}>
                    <div className="h-2 w-10 rounded-full" style={{ background: t.accent }} />
                    <p className="mt-3 text-2xl font-semibold leading-none tracking-tight">Aa</p>
                    <div className="mt-3 flex gap-1.5">
                      <span className="h-6 flex-1 rounded-md" style={{ background: rgb(t.ink[2]) }} />
                      <span className="h-6 flex-1 rounded-md" style={{ background: rgb(t.ink[3]) }} />
                      <span className="h-6 w-12 rounded-full" style={{ background: t.accent }} />
                    </div>
                    {active && (
                      <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-accent text-on-accent">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="bg-[#111114] p-3">
                    <p className="text-sm font-medium">
                      {t.label} <span className="text-[11px] text-muted">· {t.dark ? "Dark" : "Light"}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted">{t.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <DocForm groups={config.groups.filter((g) => g.title !== "Preset")} initial={doc} onSave={save} />
        </>
      )}
    </>
  );
}
