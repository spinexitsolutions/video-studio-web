import Link from "next/link";

export default function Logo({ text }: { text: string }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Home" data-cursor="hover">
      <span className="relative grid h-8 w-8 place-items-center">
        <svg viewBox="-16 -16 32 32" className="h-8 w-8 transition-transform duration-700 ease-expo group-hover:rotate-[120deg]">
          <circle r="14.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i} x1="0" y1="-14" x2="7" y2="-3" stroke="currentColor" strokeWidth="1.4" transform={`rotate(${i * 60})`} />
          ))}
        </svg>
        <span className="absolute h-2 w-2 rounded-full bg-accent" />
      </span>
      <span className="text-[17px] font-semibold tracking-[0.18em]">{text}</span>
    </Link>
  );
}
