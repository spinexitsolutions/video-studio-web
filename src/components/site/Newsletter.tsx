"use client";

import { useRef, useState } from "react";
import Captcha, { type CaptchaHandle } from "./Captcha";
import { ArrowRight, Check } from "lucide-react";

export default function Newsletter({ captcha }: { captcha?: { provider: string; siteKey: string } }) {
  const cap = useRef<CaptchaHandle>(null);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  return (
    <form
      className="relative"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("loading");
        const res = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, captcha: await cap.current?.getToken() }) });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setState("done");
          setEmail("");
        } else {
          setState("error");
          setMsg(data.error || "Something went wrong");
        }
      }}
    >
      <label htmlFor="nl" className="sr-only">
        Email
      </label>
      <input
        id="nl"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="w-full rounded-full border border-paper/10 bg-paper/[0.04] py-4 pl-6 pr-16 text-[15px] outline-none transition placeholder:text-muted focus:border-accent"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        aria-label="Subscribe"
        className="absolute right-1.5 top-1.5 grid h-[calc(100%-12px)] aspect-square place-items-center rounded-full bg-accent text-on-accent transition hover:brightness-110 disabled:opacity-60"
      >
        {state === "done" ? <Check className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
      </button>
      {captcha && captcha.provider !== "none" && (
        <div className="mt-3">
          <Captcha ref={cap} provider={captcha.provider} siteKey={captcha.siteKey} />
        </div>
      )}
      <p className="mt-3 h-4 text-xs text-muted" aria-live="polite">
        {state === "done" ? "You're on the list — welcome!" : state === "error" ? msg : "Monthly stories, tips & studio news. No spam."}
      </p>
    </form>
  );
}
