import ScrollWords from "@/components/motion/ScrollWords";

export default function Manifesto({ text }: { text: string }) {
  return (
    <section className="relative py-32 sm:py-48">
      <div className="container-x">
        <div className="mb-10 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span className="h-px w-12 bg-paper/20" /> Manifesto
        </div>
        <ScrollWords
          text={text}
          highlight={["light", "memory", "moments", "frame", "honest"]}
          className="max-w-6xl text-[clamp(1.8rem,4.2vw,4rem)] font-medium leading-[1.12] tracking-[-0.03em]"
        />
      </div>
    </section>
  );
}
