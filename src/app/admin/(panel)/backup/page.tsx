import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import BackupTools from "@/components/admin/BackupTools";

export default async function Page() {
  const me = await getCurrentUser();
  if (me?.role !== "admin") redirect("/admin");
  return <BackupTools />;
}
