import { captchaReady, integrations } from "./integrations";

/** Verifies a Cloudflare Turnstile or Google reCAPTCHA token. Passes when captcha isn't configured. */
export async function verifyCaptcha(token: string | undefined, ip?: string): Promise<boolean> {
  const i = integrations();
  if (!captchaReady(i)) return true;
  if (!token) return false;
  const url = i.captchaProvider === "turnstile" ? "https://challenges.cloudflare.com/turnstile/v0/siteverify" : "https://www.google.com/recaptcha/api/siteverify";
  const body = new URLSearchParams({ secret: i.captchaSecretKey, response: token });
  if (ip && ip !== "local") body.set("remoteip", ip);
  try {
    const res = await fetch(url, { method: "POST", body });
    const data = (await res.json()) as { success: boolean; score?: number };
    if (!data.success) return false;
    return typeof data.score === "number" ? data.score >= 0.4 : true; // reCAPTCHA v3 score
  } catch (e: any) {
    console.error("[captcha] verify failed:", e?.message);
    return false;
  }
}
