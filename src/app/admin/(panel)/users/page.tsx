import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import UsersManager from "@/components/admin/UsersManager";

export default async function Page() {
  const me = await getCurrentUser();
  if (me?.role !== "admin") redirect("/admin");
  return <UsersManager meId={me.sub} />;
}
