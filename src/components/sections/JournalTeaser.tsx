"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/lib/types";
import Img from "@/components/site/Img";
import SectionHeading from "./SectionHeading";
import { formatDate } from "@/lib/utils";

export function PostCard({ post, i = 0 }: { post: Post; i?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/journal/${post.slug}`} className="group block" data-cursor-label="Read">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[calc(24px*var(--rs))] bg-ink-200">
          <Img src={post.cover} alt={post.title} className="h-full w-full object-cover transition-transform duration-[1.4s] ease-expo group-hover:scale-105" />
        </div>
        <div className="mt-5 flex items-center gap-3 text-xs text-muted">
          <span>{formatDate(post.publishedAt)}</span>
          {post.tags?.[0] && (
            <>
              <span className="h-1 w-1 rounded-full bg-muted" />
              <span>{post.tags[0]}</span>
            </>
          )}
        </div>
        <h3 className="mt-2 flex items-start justify-between gap-4 text-2xl font-semibold tracking-tight">
          <span className="bg-gradient-to-r from-paper to-paper bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-700 ease-expo group-hover:bg-[length:100%_1px]">
            {post.title}
          </span>
          <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-muted transition-all duration-500 group-hover:rotate-45 group-hover:text-accent" />
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{post.excerpt}</p>
      </Link>
    </motion.article>
  );
}

export default function JournalTeaser({ posts, title, index }: { posts: Post[]; title: string; index?: string }) {
  if (!posts.length) return null;
  return (
    <section className="py-28 sm:py-40">
      <div className="container-x">
        <SectionHeading eyebrow="Journal" title={title} index={index}>
          <Link href="/journal" className="btn-ghost shrink-0">
            All stories <ArrowUpRight className="h-4 w-4" />
          </Link>
        </SectionHeading>
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {posts.slice(0, 3).map((p, i) => (
            <PostCard key={p.id} post={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
