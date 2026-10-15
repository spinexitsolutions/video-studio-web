import type { Metadata } from "next";
import { listDocs } from "@/lib/db";
import type { Project } from "@/lib/types";
import PageHeader from "@/components/sections/PageHeader";
import WorkGrid from "@/components/sections/WorkGrid";
import { pageHeader, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("work", { title: "Work", description: "Selected photography and film projects." });
}

export default function WorkPage() {
  const projects = listDocs<Project>("projects", { published: true });
  const h = pageHeader("work");
  return (
    <>
      <PageHeader eyebrow={`${h.eyebrow} · ${projects.length} projects`} title={h.title} subtitle={h.subtitle} />
      <WorkGrid projects={projects} />
    </>
  );
}
