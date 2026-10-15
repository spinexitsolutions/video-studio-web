"use client";

import Script from "next/script";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: any;
    grecaptcha?: any;
  }
}

export interface CaptchaHandle {
  /** Returns a fresh token ("" when captcha is disabled). */
  getToken: () => Promise<string>;
  reset: () => void;
}

/** Cloudflare Turnstile (visible widget) or Google reCAPTCHA v3 (invisible). */
const Captcha = forwardRef<CaptchaHandle, { provider: string; siteKey: string }>(function Captcha({ provider, siteKey }, ref) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (provider !== "turnstile" || !loaded || !box.current || widget.current || !window.turnstile) return;
    widget.current = window.turnstile.render(box.current, { sitekey: siteKey, theme: "auto", callback: (t: string) => setToken(t), "expired-callback": () => setToken("") });
  }, [provider, siteKey, loaded]);

  useImperativeHandle(ref, () => ({
    getToken: async () => {
      if (provider === "turnstile") return token;
      if (provider === "recaptcha" && window.grecaptcha) {
        return new Promise<string>((resolve) => window.grecaptcha.ready(() => window.grecaptcha.execute(siteKey, { action: "submit" }).then(resolve, () => resolve(""))));
      }
      return "";
    },
    reset: () => {
      if (provider === "turnstile" && window.turnstile && widget.current) window.turnstile.reset(widget.current);
      setToken("");
    },
  }));

  if (provider === "turnstile")
    return (
      <>
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setLoaded(true)} />
        <div ref={box} className="min-h-[65px]" />
      </>
    );
  if (provider === "recaptcha")
    return (
      <>
        <Script src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`} />
        <p className="text-[11px] text-muted">Protected by reCAPTCHA · Google Privacy & Terms apply.</p>
      </>
    );
  return null;
});

export default Captcha;
