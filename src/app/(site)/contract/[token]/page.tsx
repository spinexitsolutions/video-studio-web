import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { findDoc, getSingleton } from "@/lib/db";
import { publicIntegrations } from "@/lib/integrations";
import { renderMarkdown } from "@/lib/markdown";
import { fill } from "@/lib/mailer";
import { formatDate } from "@/lib/utils";
import type { Contract } from "@/lib/types";
import ContractSign from "@/components/docs/ContractSign";
import PrintButton from "@/components/docs/PrintButton";

export const metadata: Metadata = { title: "Agreement", robots: { index: false, follow: false } };

export default async function ContractPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const c = findDoc<Contract>("contracts", "token", token);
  if (!c || c.status === "draft") notFound();
  const s = getSingleton("settings");
  const cfg = publicIntegrations();
  const body = fill(c.body, { client: c.clientName, date: c.eventDate ? formatDate(c.eventDate) : "the agreed date", studio: s.siteName });

  return (
    <section className="container-x max-w-4xl pb-24 pt-32 sm:pt-40">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">Agreement</span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{c.title}</h1>
        </div>
        <PrintButton />
      </div>
      <article className="rounded-[calc(24px*var(--rs))] bg-white p-8 text-zinc-900 shadow-2xl sm:p-12 print:p-0 print:shadow-none">
        <header className="flex flex-wrap justify-between gap-6 border-b border-zinc-200 pb-6 text-sm">
          <div>
            <p className="text-lg font-bold tracking-[0.18em]">{s.logoText}</p>
            <p className="text-zinc-500">{s.siteName}</p>
          </div>
          <div className="text-right text-zinc-500">
            <p>
              Client: <span className="text-zinc-900">{c.clientName}</span>
            </p>
            {c.eventDate && <p>Event: {formatDate(c.eventDate)}</p>}
          </div>
        </header>
        <div className="prose-studio !text-[15px] !text-zinc-700 [&_h2]:!text-zinc-900 [&_strong]:!text-zinc-900" dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }} />
        {c.status === "signed" ? (
          <div className="mt-10 grid gap-6 border-t border-zinc-200 pt-8 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-400">Signed by the client</p>
              {c.signature && <img src={c.signature} alt="Signature" className="mt-2 h-24" />}
              <p className="mt-1 font-medium">{c.signedName}</p>
              <p className="text-xs text-zinc-500">
                {new Date(c.signedAt).toLocaleString()} · IP {c.signedIp}
              </p>
            </div>
            <p className="flex items-center gap-2 self-end text-sm font-medium text-emerald-600">
              <CheckCircle2 className="h-5 w-5" /> Signed electronically
            </p>
          </div>
        ) : (
          <ContractSign token={c.token} defaultName={c.clientName} captcha={{ provider: cfg.captchaProvider, siteKey: cfg.captchaSiteKey }} />
        )}
      </article>
    </section>
  );
}
