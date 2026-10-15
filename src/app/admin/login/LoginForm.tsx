"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Loader2, Lock } from "lucide-react";

export default function LoginForm({ siteName }: { siteName: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.href = next && next.startsWith("/admin") ? next : "/admin";
    } else {
      setError(data.error || "Sign in failed");
      setLoading(false);
    }
  };

  const input = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[15px] outline-none transition focus:border-accent";
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[140px]" />
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="glass relative w-full max-w-md rounded-[28px] p-8 sm:p-10">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-black">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Sign in to {siteName}</h1>
        <p className="mt-1 text-sm text-muted">Studio content management</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={input} autoComplete="username" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={input} autoComplete="current-password" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button disabled={loading} className="btn-accent w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
        <Link href="/" className="mt-6 block text-center text-sm text-muted hover:text-paper">
          ← Back to website
        </Link>
      </motion.div>
    </main>
  );
}
