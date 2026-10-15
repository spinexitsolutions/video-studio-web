import { notFound, redirect } from "next/navigation";
import { getSingletonConfig } from "@/lib/cms-schema";
import { getCurrentUser } from "@/lib/auth";
import SingletonEditor from "@/components/admin/SingletonEditor";

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const cfg = getSingletonConfig(key);
  if (!cfg) notFound();
  if (key === "theme") redirect("/admin/theme");
  if (cfg.adminOnly && (await getCurrentUser())?.role !== "admin") redirect("/admin");
  return <SingletonEditor key={key} singleton={key} />;
}
