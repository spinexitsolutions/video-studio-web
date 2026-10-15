"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Post } from "@/lib/types";
import { PostCard } from "./JournalTeaser";
import { cn } from "@/lib/utils";

export default function JournalList({ posts }: { posts: Post[] }) {
  const tags = useMemo(() => ["All", ...Array.from(new Set(posts.flatMap((p) => p.tags || [])))], [posts]);
  const [tag, setTag] = useState("All");
  const list = posts.filter((p) => tag === "All" || p.tags?.includes(tag));
  return (
    <section className="container-x pb-32">
      <div className="mb-12 flex flex-wrap gap-2">
        {tags.map((t) => (
          <button key={t} onClick={() => setTag(t)} className={cn("relative rounded-full border px-4 py-2 text-sm transition", tag === t ? "border-transparent text-ink" : "border-paper/10 text-paper/70 hover:text-paper")}>
            {tag === t && <motion.span layoutId="journal-tag" className="absolute inset-0 rounded-full bg-paper" />}
            <span className="relative">{t}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
        {list.map((p, i) => (
          <PostCard key={p.id} post={p} i={i} />
        ))}
      </div>
    </section>
  );
}
