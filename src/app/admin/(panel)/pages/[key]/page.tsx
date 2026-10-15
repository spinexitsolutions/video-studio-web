import { notFound } from "next/navigation";
import { getSingletonConfig } from "@/lib/cms-schema";
import SingletonEditor from "@/components/admin/SingletonEditor";

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!getSingletonConfig(key)) notFound();
  return <SingletonEditor key={key} singleton={key} />;
}
