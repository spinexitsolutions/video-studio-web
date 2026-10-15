"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Loader2 } from "lucide-react";
import Captcha, { type CaptchaHandle } from "@/components/site/Captcha";

export default function GalleryLogin({ slug, captcha }: { slug?: string; captcha: { provider: string; siteKey: string } }) {
  const router = useRouter();
  const cap = useRef<CaptchaHandle>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const res = await fetch("/api/gallery/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, slug, captcha: await cap.current?.getToken() }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          router.push(`/gallery/${data.slug}`);
          router.refresh();
        } else {
          setError(data.error || "Something went wrong");
          cap.current?.reset();
          setBusy(false);
        }
      }}
      className="card w-full max-w-md p-8"
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-on-accent">
        <KeyRound className="h-5 w-5" />
      </span>
      <label htmlFor="code" className="mt-6 block text-sm text-muted">
        Gallery access code
      </label>
      <input
        id="code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        autoFocus
        autoComplete="off"
        placeholder="e.g. LUMEN2026"
        className="mt-2 w-full rounded-[calc(16px*var(--rs))] border border-paper/10 bg-paper/[0.03] px-5 py-4 font-mono text-lg uppercase tracking-[0.2em] outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-muted/60 focus:border-accent"
      />
      <div className="mt-4">
        <Captcha ref={cap} provider={captcha.provider} siteKey={captcha.siteKey} />
      </div>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      <button disabled={busy} className="btn-accent mt-6 w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Open gallery <ArrowRight className="h-4 w-4" /></>}
      </button>
      <p className="mt-4 text-center text-xs text-muted">Can&apos;t find your code? It&apos;s in the email we sent when your photos were ready.</p>
    </form>
  );
}
