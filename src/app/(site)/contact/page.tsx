import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSingleton, listDocs } from "@/lib/db";
import type { Package, Service } from "@/lib/types";
import PageHeader from "@/components/sections/PageHeader";
import BookingForm from "@/components/sections/BookingForm";
import Reveal from "@/components/motion/Reveal";
import { SocialLinks } from "@/components/site/Social";

export const metadata: Metadata = { title: "Contact & Booking", description: "Book a session or tell us about your project." };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ service?: string; package?: string }> }) {
  const sp = await searchParams;
  const s = getSingleton("settings");
  const services = listDocs<Service>("services", { published: true }).map((x) => x.title);
  const packages = listDocs<Package>("packages", { published: true }).map((x) => x.name);
  const info = [
    { icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
    { icon: Phone, label: "Phone", value: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
    { icon: MapPin, label: "Studio", value: `${s.address}, ${s.city}` },
    { icon: Clock, label: "Hours", value: s.hours },
  ];
  return (
    <>
      <PageHeader eyebrow="Contact & booking" title="Let's talk." subtitle="Tell us a little about your project. We reply to every enquiry within 24 hours — usually much sooner." />
      <section className="container-x grid gap-10 pb-32 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <BookingForm services={services} packages={packages} initialService={sp.service} initialPackage={sp.package} enabled={s.bookingEnabled} email={s.email} />
        </div>
        <div className="space-y-4 lg:col-span-4 lg:col-start-9">
          {info.map((i, k) => (
            <Reveal key={i.label} delay={k * 0.08}>
              <div className="card flex items-start gap-4 p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-accent">
                  <i.icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{i.label}</p>
                  {i.href ? (
                    <a href={i.href} className="mt-1 block text-[15px] hover:text-accent">
                      {i.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-[15px]">{i.value}</p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
          <Reveal delay={0.35}>
            <div className="card p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Follow along</p>
              <SocialLinks settings={s} className="mt-4 flex-wrap" />
            </div>
          </Reveal>
          {s.mapEmbedUrl && (
            <Reveal delay={0.4}>
              <iframe src={s.mapEmbedUrl} className="h-64 w-full rounded-[22px] border-0 grayscale invert-[.92]" loading="lazy" title="Map" referrerPolicy="no-referrer-when-downgrade" />
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}
