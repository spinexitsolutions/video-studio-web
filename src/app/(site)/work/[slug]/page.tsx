import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { findDoc, listDocs } from "@/lib/db";
import type { Project } from "@/lib/types";
import { renderMarkdown } from "@/lib/markdown";
import ParallaxImage from "@/components/motion/ParallaxImage";
import SplitText from "@/components/motion/SplitText";
import Reveal from "@/components/motion/Reveal";
import ProjectGallery from "@/components/sections/ProjectGallery";
import PlayButton from "@/components/sections/PlayButton";
import Img from "@/components/site/Img";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = findDoc<Project>("projects", "slug", slug);
  if (!p) return {};
  return { title: p.title, description: p.excerpt, openGraph: { images: p.cover ? [p.cover] : [] } };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = findDoc<Project>("projects", "slug", slug);
  if (!project || project.published === false) notFound();
  const all = listDocs<Project>("projects", { published: true });
  const idx = all.findIndex((p) => p.id === project.id);
  const next = all[(idx + 1) % all.length];
  const gallery = (project.gallery || []).filter(Boolean);

  return (
    <article>
      <header className="container-x pb-14 pt-40 sm:pt-48">
        <Link href="/work" className="eyebrow hover:text-paper">
          Back to work
        </Link>
        <h1 className="display mt-6 max-w-6xl text-[clamp(3rem,8.5vw,8.5rem)]">
          <SplitText text={project.title} by="char" stagger={0.02} />
        </h1>
        <Reveal delay={0.3}>
          <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-white/[0.08] pt-8 sm:grid-cols-4">
            {[
              ["Client", project.client],
              ["Category", project.category],
              ["Year", project.year],
              ["Location", project.location],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{k}</dt>
                <dd className="mt-2 text-[15px]">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </header>

      <ParallaxImage src={project.cover} alt={project.title} className="mx-3 aspect-[4/5] rounded-[28px] sm:mx-6 sm:aspect-[21/9]" />

      <section className="container-x grid gap-12 py-24 lg:grid-cols-12 lg:py-32">
        <div className="lg:col-span-4">
          <span className="eyebrow">The story</span>
          <p className="mt-6 text-2xl font-medium leading-snug tracking-tight">{project.excerpt}</p>
          {project.videoUrl && (
            <div className="mt-8">
              <PlayButton url={project.videoUrl} />
            </div>
          )}
        </div>
        <div className="prose-studio lg:col-span-7 lg:col-start-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(project.description) }} />
      </section>

      {gallery.length > 0 && (
        <section className="container-x pb-24">
          <ProjectGallery images={gallery} />
        </section>
      )}

      {next && next.id !== project.id && (
        <Link href={`/work/${next.slug}`} className="group relative block overflow-hidden border-t border-white/[0.08]" data-cursor-label="Next">
          <div className="absolute inset-0 opacity-0 transition-opacity duration-1000 group-hover:opacity-40">
            <Img src={next.cover} alt="" className="h-full w-full scale-110 object-cover transition-transform duration-[2s] ease-expo group-hover:scale-100" />
          </div>
          <div className="container-x relative flex items-end justify-between gap-6 py-24 sm:py-32">
            <div>
              <span className="eyebrow">Next project</span>
              <p className="display mt-4 text-[clamp(2.5rem,7vw,7rem)] transition-transform duration-700 ease-expo group-hover:translate-x-4">{next.title}</p>
            </div>
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-white/20 transition-all duration-700 ease-expo group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-black">
              <ArrowUpRight className="h-7 w-7" />
            </span>
          </div>
        </Link>
      )}
    </article>
  );
}
