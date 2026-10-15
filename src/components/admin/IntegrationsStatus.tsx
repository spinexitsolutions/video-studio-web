"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Loader2, Mail } from "lucide-react";
import { api } from "./api";
import { useToast } from "./Toast";
import { inputCls } from "./Fields";

export default function IntegrationsStatus({ doc }: { doc: Record<string, any> }) {
  const toast = useToast();
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const items = [
    { label: "Razorpay", ok: doc.razorpayEnabled && doc.razorpayKeyId && doc.razorpayKeySecret },
    { label: "Cloudinary", ok: doc.cloudinaryEnabled && doc.cloudinaryCloudName && doc.cloudinaryApiSecret },
    { label: "Email (SMTP)", ok: doc.smtpEnabled && doc.smtpHost },
    { label: "Captcha", ok: doc.captchaProvider !== "none" && doc.captchaSiteKey && doc.captchaSecretKey },
    { label: "Analytics", ok: doc.gaMeasurementId || doc.gtmId || doc.metaPixelId },
    { label: "Webhook", ok: !!doc.webhookUrl },
  ];
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-paper/[0.07] bg-[#111114] p-5 lg:col-span-2">
        <p className="text-sm font-semibold">Connection status</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((i) => (
            <span key={i.label} className="flex items-center gap-2 rounded-xl bg-paper/[0.03] px-3 py-2.5 text-sm">
              {i.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-muted" />}
              {i.label}
              <span className={`ml-auto text-[11px] ${i.ok ? "text-emerald-400" : "text-muted"}`}>{i.ok ? "On" : "Off"}</span>
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">
          Razorpay webhook URL: <code className="text-paper/80">{typeof window !== "undefined" ? window.location.origin : ""}/api/payments/webhook</code> · Save your changes before testing.
        </p>
      </div>
      <div className="rounded-2xl border border-paper/[0.07] bg-[#111114] p-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Mail className="h-4 w-4 text-accent" /> Send a test email
        </p>
        <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="you@example.com (default: your login)" className={`${inputCls} mt-3`} />
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await api("/api/admin/test-email", { method: "POST", json: { to } });
              toast("Test email sent — check your inbox");
            } catch (e: any) {
              toast(e.message, "error");
            }
            setBusy(false);
          }}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-paper px-4 py-2.5 text-sm font-medium text-ink disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send test
        </button>
      </div>
    </div>
  );
}
