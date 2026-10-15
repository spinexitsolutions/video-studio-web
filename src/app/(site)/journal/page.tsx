import type { Metadata } from "next";
import { listDocs } from "@/lib/db";
import type { Post } from "@/lib/types";
import PageHeader from "@/components/sections/PageHeader";
import JournalList from "@/components/sections/JournalList";

export const metadata: Metadata = { title: "Journal", description: "Stories, tips and behind-the-scenes from the studio." };

export default function JournalPage() {
  const posts = listDocs<Post>("posts", { published: true }).sort((a, b) => (b.publishedAt > a.publishedAt ? 1 : -1));
  return (
    <>
      <PageHeader eyebrow="Journal" title="Notes on light." subtitle="Field guides, behind-the-scenes and the stories behind our favourite frames." />
      <JournalList posts={posts} />
    </>
  );
}
