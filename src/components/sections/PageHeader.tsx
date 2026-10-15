import SplitText from "@/components/motion/SplitText";
import Reveal from "@/components/motion/Reveal";
import ScrambleText from "@/components/motion/ScrambleText";

export default function PageHeader({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <header className="container-x pb-16 pt-40 sm:pb-24 sm:pt-48">
      <span className="eyebrow">
        <ScrambleText text={eyebrow} />
      </span>
      <h1 className="display mt-6 max-w-6xl text-[clamp(3rem,9vw,9rem)]">
        <SplitText text={title} by="char" stagger={0.02} />
      </h1>
      {subtitle && (
        <Reveal delay={0.3}>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{subtitle}</p>
        </Reveal>
      )}
      {children}
    </header>
  );
}
