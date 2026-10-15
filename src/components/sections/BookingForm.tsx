"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import DatePicker from "@/components/site/DatePicker";
import Captcha, { type CaptchaHandle } from "@/components/site/Captcha";
import { payWithRazorpay } from "@/components/site/razorpay";
import { formatMoney } from "@/lib/money";

interface Props {
  services: string[];
  packages: { name: string; amount: number }[];
  deposit: { enabled: boolean; type: "percent" | "fixed"; percent: number; fixed: number; required: boolean; currency: string };
  captcha: { provider: string; siteKey: string };
  terms: string;
  legal: { href: string; label: string }[];
  initialService?: string;
  initialPackage?: string;
  enabled: boolean;
  email: string;
}

const BUDGETS = ["< ₹50k", "₹50k – 1.5L", "₹1.5L – 3L", "₹3L+", "Not sure yet"];
const STEPS = ["The project", "Date & place", "About you"];

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2.5 text-sm transition-all duration-300",
        active ? "border-accent bg-accent text-on-accent" : "border-paper/10 bg-paper/[0.03] text-paper/80 hover:border-paper/30"
      )}
    >
      {children}
    </button>
  );
}

const inputCls =
  "w-full rounded-2xl border border-paper/10 bg-paper/[0.03] px-5 py-4 text-[15px] outline-none transition placeholder:text-muted/70 focus:border-accent focus:bg-paper/[0.05]";

export default function BookingForm({ services, packages, deposit, captcha, terms, legal, initialService = "", initialPackage = "", enabled, email }: Props) {
  const captchaRef = useRef<CaptchaHandle>(null);
  const [paid, setPaid] = useState(false);
  const [payNow, setPayNow] = useState(true);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [status, setStatus] = useState<"idle" | "sending" | "paying" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [f, setF] = useState({ service: initialService, package: initialPackage, date: "", location: "", budget: "", name: "", email: "", phone: "", message: "", website: "" });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const go = (d: number) => {
    setError("");
    if (d > 0 && step === 0 && !f.service) return setError("Pick the kind of shoot you have in mind.");
    setDir(d);
    setStep((s) => Math.min(STEPS.length - 1, Math.max(0, s + d)));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) return go(1);
    if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email)) return setError("Please add your name and a valid email.");
    setStatus("sending");
    setError("");
    const token = await captchaRef.current?.getToken();
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...f, captcha: token, payDeposit: depositAmount > 0 && (payNow || deposit.required) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("error");
      captchaRef.current?.reset();
      setError(data.error || "Something went wrong — please try again.");
      return;
    }
    if (data.checkout) {
      setStatus("paying");
      try {
        setPaid(await payWithRazorpay(data.checkout));
      } catch (e: any) {
        setError(e.message);
      }
    }
    setStatus("done");
  };

  const pkg = packages.find((p) => p.name === f.package);
  const depositAmount = !deposit.enabled ? 0 : deposit.type === "percent" && pkg?.amount ? Math.round((pkg.amount * deposit.percent) / 100) : deposit.fixed;

  if (!enabled) {
    return (
      <div className="card p-10">
        <h3 className="text-2xl font-semibold">Online booking is paused</h3>
        <p className="mt-3 text-muted">
          Please email us at{" "}
          <a href={`mailto:${email}`} className="text-accent underline">
            {email}
          </a>{" "}
          and we&apos;ll get back to you within a day.
        </p>
      </div>
    );
  }

  if (status === "done") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card relative overflow-hidden p-10 text-center sm:p-16">
        <motion.div className="pointer-events-none absolute inset-0 bg-white" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.8 }} />
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-accent text-on-accent">
          <Check className="h-9 w-9" strokeWidth={2.5} />
        </motion.span>
        <h3 className="mt-8 text-3xl font-semibold tracking-tight">Thank you, {f.name.split(" ")[0] || "friend"}!</h3>
        <p className="mx-auto mt-3 max-w-md text-muted">Your enquiry is in. We&apos;ll reply to {f.email} within 24 hours with availability and a tailored proposal.</p>
        {paid && (
          <p className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-sm text-emerald-500">
            <Check className="h-4 w-4" /> Deposit of {formatMoney(depositAmount, deposit.currency)} received — your date is secured.
          </p>
        )}
        {!paid && error && <p className="mx-auto mt-6 max-w-md text-sm text-amber-500">{error} — don&apos;t worry, your enquiry was saved and we&apos;ll send you a payment link.</p>}
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="card relative overflow-hidden p-6 sm:p-10" noValidate>
      {/* progress */}
      <div className="flex items-center gap-3">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col gap-2">
            <div className="h-1 overflow-hidden rounded-full bg-paper/10">
              <motion.div className="h-full bg-accent" animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
            </div>
            <span className={cn("hidden font-mono text-[10px] uppercase tracking-[0.18em] sm:block", i <= step ? "text-paper" : "text-muted")}>
              0{i + 1} · {s}
            </span>
          </div>
        ))}
      </div>

      <div className="relative mt-10 min-h-[420px]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: dir * -40, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            {step === 0 && (
              <>
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight">What are we creating?</h3>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {services.map((s) => (
                      <Chip key={s} active={f.service === s} onClick={() => set("service", s)}>
                        {s}
                      </Chip>
                    ))}
                    <Chip active={f.service === "Something else"} onClick={() => set("service", "Something else")}>
                      Something else
                    </Chip>
                  </div>
                </div>
                {packages.length > 0 && (
                  <div>
                    <h4 className="text-sm text-muted">Interested in a package? (optional)</h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {packages.map((p) => (
                        <Chip key={p.name} active={f.package === p.name} onClick={() => set("package", f.package === p.name ? "" : p.name)}>
                          {p.name}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {step === 1 && (
              <>
                <h3 className="text-2xl font-semibold tracking-tight">When and where?</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <span className="mb-2 block text-sm text-muted">Preferred date {f.date && <span className="text-paper">· {f.date}</span>}</span>
                    <DatePicker value={f.date} onChange={(v) => set("date", v)} />
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-sm text-muted">Location</span>
                    <input value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="City, venue or studio" className={inputCls} />
                  </label>
                </div>
                <div>
                  <span className="text-sm text-muted">Budget range</span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {BUDGETS.map((b) => (
                      <Chip key={b} active={f.budget === b} onClick={() => set("budget", b)}>
                        {b}
                      </Chip>
                    ))}
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h3 className="text-2xl font-semibold tracking-tight">Tell us about you.</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input required value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name *" className={inputCls} autoComplete="name" />
                  <input required type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="Email *" className={inputCls} autoComplete="email" />
                  <input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone / WhatsApp" className={cn(inputCls, "sm:col-span-2")} autoComplete="tel" />
                  <textarea value={f.message} onChange={(e) => set("message", e.target.value)} rows={4} placeholder="Tell us your story — the vibe, the people, anything we should know." className={cn(inputCls, "resize-none sm:col-span-2")} />
                  <input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website", e.target.value)} className="hidden" aria-hidden />
                </div>
                {depositAmount > 0 && (
                  <label className="flex cursor-pointer items-start gap-3 rounded-[calc(18px*var(--rs))] border border-accent/30 bg-accent/[0.06] p-4">
                    {!deposit.required && <input type="checkbox" checked={payNow} onChange={(e) => setPayNow(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--accent)]" />}
                    <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <span className="text-sm">
                      <span className="font-medium">
                        {deposit.required ? "Secure your date with" : "Pay"} a {formatMoney(depositAmount, deposit.currency)} deposit {deposit.required ? "" : "now"}
                      </span>
                      <span className="block text-muted">Secure checkout by Razorpay · UPI, cards, netbanking & wallets. Adjusted against your final invoice.</span>
                    </span>
                  </label>
                )}
                <Captcha ref={captchaRef} provider={captcha.provider} siteKey={captcha.siteKey} />
                {(terms || legal.length > 0) && (
                  <p className="text-xs text-muted">
                    {terms}{" "}
                    {legal.map((l, i) => (
                      <span key={l.href}>
                        {i > 0 && " · "}
                        <Link href={l.href} target="_blank" className="underline hover:text-paper">
                          {l.label}
                        </Link>
                      </span>
                    ))}
                  </p>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="h-5 text-sm text-red-400" aria-live="polite">
        {error}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <button type="button" onClick={() => go(-1)} className={cn("btn-ghost", step === 0 && "invisible")}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button type="submit" disabled={status === "sending"} className="btn-accent min-w-[160px]">
          {status === "sending" || status === "paying" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : step < STEPS.length - 1 ? (
            <>
              Continue <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            <>
              {depositAmount > 0 && (payNow || deposit.required) ? "Send & pay deposit" : "Send enquiry"} <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
