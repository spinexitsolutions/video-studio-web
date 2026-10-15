import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSingleton, listDocs } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  const s = getSingleton("settings");
  const newBookings = listDocs("bookings").filter((b) => b.status === "new").length;
  return (
    <AdminShell user={{ name: user.name, email: user.email, role: user.role }} siteName={s.siteName} newBookings={newBookings}>
      {children}
    </AdminShell>
  );
}
