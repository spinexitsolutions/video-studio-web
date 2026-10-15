import { getSingleton, listDocs } from "@/lib/db";
import type { CameraFeature, Client, Faq as FaqT, Package, Post, ProcessStep, Project, Service, Stat, TeamMember, Testimonial } from "@/lib/types";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import CameraStory from "@/components/sections/CameraStory";
import Clients from "@/components/sections/Clients";
import Services from "@/components/sections/Services";
import FilmStrip from "@/components/sections/FilmStrip";
import Stats from "@/components/sections/Stats";
import Showreel from "@/components/sections/Showreel";
import Retouch from "@/components/sections/Retouch";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import Pricing from "@/components/sections/Pricing";
import Team from "@/components/sections/Team";
import JournalTeaser from "@/components/sections/JournalTeaser";
import Faq from "@/components/sections/Faq";
import Cta from "@/components/sections/Cta";

export default function HomePage() {
  const settings = getSingleton("settings");
  const hero = getSingleton("hero");
  const home = getSingleton("home");
  const pub = { published: true } as const;

  const projects = listDocs<Project>("projects", pub);
  const featured = projects.filter((p) => p.featured);

  const render: Record<string, (n?: string) => React.ReactNode> = {
    manifesto: () => home.manifesto && <Manifesto text={home.manifesto} />,
    camera: () => {
      const features = listDocs<CameraFeature>("cameraFeatures", pub);
      return features.length > 0 && <CameraStory home={home} features={features} accent={settings.accentColor} />;
    },
    clients: () => <Clients clients={listDocs<Client>("clients", pub)} />,
    services: (n) => <Services index={n} services={listDocs<Service>("services", pub)} eyebrow={home.servicesEyebrow} title={home.servicesTitle} />,
    work: (n) => (featured.length || projects.length) > 0 && <FilmStrip index={n} projects={featured.length ? featured : projects.slice(0, 6)} eyebrow={home.workEyebrow} title={home.workTitle} brand={settings.logoText} />,
    stats: () => <Stats stats={listDocs<Stat>("stats", pub)} />,
    showreel: () => home.showreelPoster && <Showreel title={home.showreelTitle} subtitle={home.showreelSubtitle} poster={home.showreelPoster} videoUrl={home.showreelVideoUrl} />,
    retouch: (n) => home.retouchAfter && <Retouch index={n} title={home.retouchTitle} subtitle={home.retouchSubtitle} before={home.retouchBefore} after={home.retouchAfter} />,
    process: (n) => <Process index={n} steps={listDocs<ProcessStep>("process", pub)} title={home.processTitle} />,
    testimonials: (n) => <Testimonials index={n} items={listDocs<Testimonial>("testimonials", pub)} title={home.testimonialsTitle} />,
    pricing: (n) => <Pricing index={n} packages={listDocs<Package>("packages", pub)} title={home.pricingTitle} subtitle={home.pricingSubtitle} />,
    team: (n) => <Team index={n} team={listDocs<TeamMember>("team", pub)} title={home.teamTitle} />,
    journal: (n) => (
      <JournalTeaser index={n} posts={listDocs<Post>("posts", pub).sort((a, b) => (b.publishedAt > a.publishedAt ? 1 : -1))} title={home.journalTitle} />
    ),
    faq: (n) => <Faq index={n} faqs={listDocs<FaqT>("faqs", pub)} title={home.faqTitle} />,
    cta: () => <Cta title={home.ctaTitle} subtitle={home.ctaSubtitle} image={home.ctaImage} />,
  };

  // number the headed sections in the order the admin arranged them
  const numbered = new Set(["services", "work", "retouch", "process", "testimonials", "pricing", "team", "journal", "faq"]);
  let count = 0;
  return (
    <>
      <Hero hero={hero} />
      {home.sections
        .filter((s) => s.enabled && render[s.key])
        .map((s) => (
          <div key={s.key} id={s.key}>
            {render[s.key](numbered.has(s.key) ? String(++count).padStart(2, "0") : undefined)}
          </div>
        ))}
    </>
  );
}
