import SplitText from "@/components/motion/SplitText";
import Reveal from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  index,
  align = "left",
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  index?: string;
  align?: "left" | "center";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", align === "center" && "items-center text-center md:flex-col md:items-center", className)}>
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {(eyebrow || index) && (
          <div className="flex items-center gap-3">
            {index && <span className="font-mono text-[11px] text-accent">[{index}]</span>}
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          </div>
        )}
        <h2 className="display mt-5 text-[clamp(2.4rem,5.5vw,5rem)]">
          <SplitText text={title} />
        </h2>
        {subtitle && (
          <Reveal delay={0.2}>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted">{subtitle}</p>
          </Reveal>
        )}
      </div>
      {children}
    </div>
  );
}
