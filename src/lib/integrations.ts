import { getSingleton } from "./db";
import type { Integrations } from "./types";

export const SECRET_FIELDS = ["razorpayKeySecret", "razorpayWebhookSecret", "cloudinaryApiSecret", "smtpPass", "captchaSecretKey"] as const;
export const SECRET_MASK = "••••••••";

export const integrations = (): Integrations => getSingleton("integrations");

export const razorpayReady = (i = integrations()) => i.razorpayEnabled && !!i.razorpayKeyId && !!i.razorpayKeySecret;
export const smtpReady = (i = integrations()) => i.smtpEnabled && !!i.smtpHost && !!(i.smtpFromEmail || i.smtpUser);
export const cloudinaryReady = (i = integrations()) => i.cloudinaryEnabled && !!i.cloudinaryCloudName && !!i.cloudinaryApiKey && !!i.cloudinaryApiSecret;
export const captchaReady = (i = integrations()) => i.captchaProvider !== "none" && !!i.captchaSiteKey && !!i.captchaSecretKey;

/** The only integration values that are ever sent to the browser. */
export function publicIntegrations() {
  const i = integrations();
  return {
    captchaProvider: captchaReady(i) ? i.captchaProvider : "none",
    captchaSiteKey: captchaReady(i) ? i.captchaSiteKey : "",
    razorpay: razorpayReady(i),
    currency: i.currency || "INR",
    gaMeasurementId: i.gaMeasurementId,
    gtmId: i.gtmId,
    metaPixelId: i.metaPixelId,
    protectImages: i.protectImages,
  };
}
export type PublicIntegrations = ReturnType<typeof publicIntegrations>;

/** Hide secrets when integrations are sent to the admin UI. */
export function maskSecrets(i: Integrations) {
  const out: Record<string, any> = { ...i };
  for (const k of SECRET_FIELDS) out[k] = i[k] ? SECRET_MASK : "";
  return out;
}

/** Keep existing secrets when the admin form sends back the mask. */
export function unmaskSecrets(incoming: Record<string, any>, current: Integrations) {
  const out = { ...incoming };
  for (const k of SECRET_FIELDS) if (out[k] === SECRET_MASK) out[k] = current[k];
  return out;
}
