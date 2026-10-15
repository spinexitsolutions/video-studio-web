import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findDoc } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import type { CustomPage } from "@/lib/types";
import PageHeader from "@/components/sections/PageHeader";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = findDoc<CustomPage>("customPages", "slug", slug);
  if (!p || p.published === false) return {};
  return { title: p.seoTitle || p.title, description: p.seoDescription };
}

export default async function CustomPageView({ params }: Props) {
  const { slug } = await params;
  const p = findDoc<CustomPage>("customPages", "slug", slug);
  if (!p || p.published === false) notFound();
  return (
    <>
      <PageHeader eyebrow="Information" title={p.title} />
      <article className="container-x max-w-3xl pb-32">
        <div className="prose-studio" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.content) }} />
      </article>
    </>
  );
}
