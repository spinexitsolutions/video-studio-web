"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Loader2, PenLine } from "lucide-react";
import SignaturePad, { type SignatureHandle } from "./SignaturePad";
import Captcha, { type CaptchaHandle } from "@/components/site/Captcha";

export default function ContractSign({ token, defaultName, captcha }: { token: string; defaultName: string; captcha: { provider: string; siteKey: string } }) {
  const router = useRouter();
  const pad = useRef<SignatureHandle>(null);
  const cap = useRef<CaptchaHandle>(null);
  const [name, setName] = useState(defaultName);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (pad.current?.isEmpty()) return setError("Please draw your signature.");
        setBusy(true);
        setError("");
        const r = await fetch(`/api/contract/${token}/sign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, signature: pad.current!.toDataURL(), agree, captcha: await cap.current?.getToken() }),
        });
        const d = await r.json().catch(() => ({}));
        if (r.ok) router.refresh();
        else {
          setError(d.error || "Couldn't sign");
          cap.current?.reset();
          setBusy(false);
        }
      }}
      className="no-print mt-8 space-y-4 rounded-[calc(24px*var(--rs))] border border-zinc-200 bg-zinc-50 p-6 text-zinc-900"
    >
      <h3 className="flex items-center gap-2 text-lg font-semibold">
        <PenLine className="h-5 w-5" /> Sign this agreement
      </h3>
      <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your full legal name" className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-zinc-900" />
      <SignaturePad ref={pad} />
      <label className="flex items-start gap-3 text-sm text-zinc-600">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4" />I have read and agree to this agreement. I understand my typed name and drawn signature are a legally binding electronic signature.
      </label>
      <Captcha ref={cap} provider={captcha.provider} siteKey={captcha.siteKey} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={busy || !agree} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3.5 font-medium text-white disabled:opacity-40">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign & accept"}
      </button>
    </form>
  );
}
