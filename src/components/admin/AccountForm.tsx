"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "./api";
import { useToast } from "./Toast";
import PageTitle from "./PageTitle";
import { inputCls } from "./Fields";

export default function AccountForm({ name, email, role }: { name: string; email: string; role: string }) {
  const toast = useToast();
  const [f, setF] = useState({ name, currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  return (
    <>
      <PageTitle title="My account" description={`${email} · ${role}`} />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (f.newPassword && f.newPassword !== f.confirm) return toast("New passwords don't match", "error");
          setBusy(true);
          try {
            await api("/api/admin/account", { method: "PUT", json: { name: f.name, currentPassword: f.currentPassword, newPassword: f.newPassword } });
            toast(f.newPassword ? "Profile and password updated" : "Profile updated");
            setF((s) => ({ ...s, currentPassword: "", newPassword: "", confirm: "" }));
          } catch (e: any) {
            toast(e.message, "error");
          } finally {
            setBusy(false);
          }
        }}
        className="max-w-xl space-y-6"
      >
        <section className="space-y-4 rounded-2xl border border-white/[0.07] bg-[#111114] p-6">
          <h2 className="font-semibold">Profile</h2>
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium">Display name</span>
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} />
          </label>
        </section>
        <section className="space-y-4 rounded-2xl border border-white/[0.07] bg-[#111114] p-6">
          <h2 className="font-semibold">Change password</h2>
          <input type="password" placeholder="Current password" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} className={inputCls} autoComplete="current-password" />
          <input type="password" placeholder="New password (8+ characters)" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} className={inputCls} autoComplete="new-password" />
          <input type="password" placeholder="Confirm new password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} className={inputCls} autoComplete="new-password" />
        </section>
        <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save
        </button>
      </form>
    </>
  );
}
