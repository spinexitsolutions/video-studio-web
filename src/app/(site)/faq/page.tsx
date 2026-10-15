import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSingleton, listDocs } from "@/lib/db";
import type { Faq as FaqT } from "@/lib/types";
import PageHeader from "@/components/sections/PageHeader";
import Faq from "@/components/sections/Faq";
import { pageHeader, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("faq", { title: "FAQ", description: "Answers to common questions about booking, shoots, delivery and payments." });
}

export default function FaqPage() {
  const h = pageHeader("faq");
  const faqs = listDocs<FaqT>("faqs", { published: true });
  const s = getSingleton("settings");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHeader eyebrow={h.eyebrow} title={h.title} subtitle={h.subtitle} />
      <div className="-mt-28">
        <Faq faqs={faqs} title="Everything you asked." />
      </div>
      <section className="container-x pb-28">
        <div className="card flex flex-col items-start justify-between gap-6 p-10 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Still have a question?</h2>
            <p className="mt-2 text-muted">Write to {s.email} or send us a message — we reply within a day.</p>
          </div>
          <Link href="/contact" className="btn-accent">
            Ask us <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
