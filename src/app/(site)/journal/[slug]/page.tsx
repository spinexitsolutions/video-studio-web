import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findDoc, listDocs } from "@/lib/db";
import type { Post } from "@/lib/types";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate, readingTime } from "@/lib/utils";
import SplitText from "@/components/motion/SplitText";
import ParallaxImage from "@/components/motion/ParallaxImage";
import { PostCard } from "@/components/sections/JournalTeaser";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = findDoc<Post>("posts", "slug", slug);
  if (!p) return {};
  return { title: p.title, description: p.excerpt, openGraph: { type: "article", images: p.cover ? [p.cover] : [] } };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = findDoc<Post>("posts", "slug", slug);
  if (!post || post.published === false) notFound();
  const more = listDocs<Post>("posts", { published: true }).filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <article>
      <header className="container-x max-w-5xl pb-14 pt-40 text-center sm:pt-48">
        <Link href="/journal" className="eyebrow hover:text-paper">
          Journal
        </Link>
        <h1 className="display mt-6 text-[clamp(2.6rem,6.5vw,6rem)]">
          <SplitText text={post.title} />
        </h1>
        <p className="mt-8 text-sm text-muted">
          {post.author} · {formatDate(post.publishedAt)} · {readingTime(post.content)} min read
        </p>
      </header>
      {post.cover && <ParallaxImage src={post.cover} alt={post.title} className="mx-3 aspect-[16/10] rounded-[28px] sm:mx-6 sm:aspect-[21/9]" />}
      <div className="container-x max-w-3xl py-20">
        <p className="text-2xl font-medium leading-snug tracking-tight">{post.excerpt}</p>
        <div className="prose-studio mt-10" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />
        {post.tags?.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
      {more.length > 0 && (
        <section className="container-x border-t border-white/[0.08] py-24">
          <h2 className="text-3xl font-semibold tracking-tight">Keep reading</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {more.map((p, i) => (
              <PostCard key={p.id} post={p} i={i} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
