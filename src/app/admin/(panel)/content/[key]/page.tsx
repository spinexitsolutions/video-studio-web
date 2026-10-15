import { notFound } from "next/navigation";
import { getCollectionConfig } from "@/lib/cms-schema";
import CollectionList from "@/components/admin/CollectionList";

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const config = getCollectionConfig(key);
  if (!config) notFound();
  return <CollectionList config={config} />;
}
