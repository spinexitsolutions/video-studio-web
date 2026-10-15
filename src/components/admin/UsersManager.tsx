"use client";

import { useEffect, useState } from "react";
import { KeyRound, Loader2, Plus, Trash2 } from "lucide-react";
import { api, timeAgo } from "./api";
import { useToast } from "./Toast";
import PageTitle from "./PageTitle";
import { inputCls } from "./Fields";
import { cn } from "@/lib/utils";

type U = { id: string; name: string; email: string; role: "admin" | "editor"; createdAt: string };

export default function UsersManager({ meId }: { meId: string }) {
  const toast = useToast();
  const [users, setUsers] = useState<U[] | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "editor" });
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<U[]>("/api/admin/users").then(setUsers).catch((e) => toast(e.message, "error"));
  }, [toast]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await api<U>("/api/admin/users", { method: "POST", json: form });
      setUsers((l) => [...l!, u]);
      setForm({ name: "", email: "", password: "", role: "editor" });
      setAdding(false);
      toast("User created");
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const update = async (id: string, data: Record<string, any>, msg: string) => {
    try {
      const u = await api<U>(`/api/admin/users/${id}`, { method: "PUT", json: data });
      setUsers((l) => l!.map((x) => (x.id === id ? u : x)));
      toast(msg);
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  return (
    <>
      <PageTitle title="Users" description="Admins can manage everything. Editors can manage content but not users or backups.">
        <button onClick={() => setAdding((a) => !a)} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent">
          <Plus className="h-4 w-4" /> Invite user
        </button>
      </PageTitle>
      {adding && (
        <form onSubmit={create} className="mb-6 grid gap-3 rounded-2xl border border-paper/[0.07] bg-[#111114] p-6 sm:grid-cols-2">
          <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
          <input required type="password" minLength={8} placeholder="Temporary password (8+ chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
            <option value="editor" className="bg-[#121215]">Editor</option>
            <option value="admin" className="bg-[#121215]">Admin</option>
          </select>
          <div className="flex gap-2 sm:col-span-2">
            <button disabled={busy} className="rounded-xl bg-paper px-5 py-2.5 text-sm font-medium text-ink disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create user"}
            </button>
            <button type="button" onClick={() => setAdding(false)} className="rounded-xl px-4 py-2.5 text-sm text-muted">
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="overflow-hidden rounded-2xl border border-paper/[0.07] bg-[#111114]">
        {!users ? (
          <div className="grid h-40 place-items-center text-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <ul className="divide-y divide-paper/[0.05]">
            {users.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-accent to-pink-500 font-semibold text-on-accent">{u.name[0]?.toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {u.name} {u.id === meId && <span className="text-xs text-muted">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {u.email} · joined {timeAgo(u.createdAt)}
                  </p>
                </div>
                <select
                  value={u.role}
                  disabled={u.id === meId}
                  onChange={(e) => update(u.id, { role: e.target.value }, "Role updated")}
                  className={cn(inputCls, "w-auto py-2 disabled:opacity-50")}
                >
                  <option value="editor" className="bg-[#121215]">Editor</option>
                  <option value="admin" className="bg-[#121215]">Admin</option>
                </select>
                <button
                  onClick={() => {
                    const p = prompt(`New password for ${u.name} (8+ characters):`);
                    if (p) update(u.id, { password: p }, "Password reset");
                  }}
                  className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-paper/5 hover:text-paper"
                  title="Reset password"
                >
                  <KeyRound className="h-4 w-4" />
                </button>
                <button
                  disabled={u.id === meId}
                  onClick={async () => {
                    if (!confirm(`Remove ${u.name}?`)) return;
                    try {
                      await api(`/api/admin/users/${u.id}`, { method: "DELETE" });
                      setUsers((l) => l!.filter((x) => x.id !== u.id));
                      toast("User removed");
                    } catch (e: any) {
                      toast(e.message, "error");
                    }
                  }}
                  className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-400 disabled:opacity-20"
                  title="Remove user"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
