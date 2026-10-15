import type { Metadata } from "next";
import { listDocs } from "@/lib/db";
import type { Post } from "@/lib/types";
import PageHeader from "@/components/sections/PageHeader";
import JournalList from "@/components/sections/JournalList";
import { pageHeader, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("journal", { title: "Journal", description: "Stories, tips and behind-the-scenes from the studio." });
}

export default function JournalPage() {
  const h = pageHeader("journal");
  const posts = listDocs<Post>("posts", { published: true }).sort((a, b) => (b.publishedAt > a.publishedAt ? 1 : -1));
  return (
    <>
      <PageHeader eyebrow={h.eyebrow} title={h.title} subtitle={h.subtitle} />
      <JournalList posts={posts} />
    </>
  );
}
