import Counter from "@/components/motion/Counter";
import Reveal from "@/components/motion/Reveal";
import type { Stat } from "@/lib/types";

export default function Stats({ stats }: { stats: Stat[] }) {
  return (
    <section className="py-24 sm:py-32">
      <div className="container-x grid grid-cols-2 border-t border-paper/[0.07] lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.08} className="border-b border-paper/[0.07] py-10 pr-6 lg:border-b-0 lg:border-r lg:last:border-r-0 lg:[&:not(:first-child)]:pl-8">
            <Counter value={s.value} suffix={s.suffix} className="block text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-none tracking-tightest tabular-nums" />
            <p className="mt-4 text-sm text-muted">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
