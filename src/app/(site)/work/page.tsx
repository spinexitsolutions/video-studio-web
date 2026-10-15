import type { Metadata } from "next";
import { listDocs } from "@/lib/db";
import type { Project } from "@/lib/types";
import PageHeader from "@/components/sections/PageHeader";
import WorkGrid from "@/components/sections/WorkGrid";

export const metadata: Metadata = { title: "Work", description: "Selected photography and film projects." };

export default function WorkPage() {
  const projects = listDocs<Project>("projects", { published: true });
  return (
    <>
      <PageHeader eyebrow={`Portfolio · ${projects.length} projects`} title="Selected work." subtitle="Weddings, campaigns, portraits and films — a few of the stories we've been trusted to tell." />
      <WorkGrid projects={projects} />
    </>
  );
}
