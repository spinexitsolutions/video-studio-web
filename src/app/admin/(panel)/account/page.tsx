import { getCurrentUser } from "@/lib/auth";
import AccountForm from "@/components/admin/AccountForm";

export default async function Page() {
  const me = await getCurrentUser();
  return <AccountForm name={me!.name} email={me!.email} role={me!.role} />;
}
