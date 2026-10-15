import { notFound } from "next/navigation";
import { getCollectionConfig } from "@/lib/cms-schema";
import DocEditor from "@/components/admin/DocEditor";

export default async function Page({ params }: { params: Promise<{ key: string; id: string }> }) {
  const { key, id } = await params;
  if (!getCollectionConfig(key)) notFound();
  return <DocEditor key={id} collection={key} id={id} />;
}
