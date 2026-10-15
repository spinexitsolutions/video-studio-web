import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">Error 404 · Out of focus</p>
      <h1 className="mt-6 text-[clamp(6rem,22vw,16rem)] font-bold leading-none tracking-tightest blur-[2px]">404</h1>
      <p className="mt-4 max-w-md text-muted">This frame doesn&apos;t exist — maybe it was never taken, or it&apos;s been moved.</p>
      <Link href="/" className="btn-primary mt-10">
        Back to the studio
      </Link>
    </main>
  );
}
