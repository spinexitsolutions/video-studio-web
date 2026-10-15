"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { sized, srcSet } from "@/lib/img-url";

/** Responsive <img> (auto srcset for Cloudinary, Unsplash & uploads), lazy loaded with a fade-in and a graceful fallback. */
export default function Img({ src, alt = "", className, onLoad, sizes = "100vw", ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  if (!src || state === "error") {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("flex items-center justify-center bg-gradient-to-br from-ink-300 via-ink-200 to-ink-100", className)}
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-white/15" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="10" />
          <path d="m14.31 8 5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16 3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94" />
        </svg>
      </div>
    );
  }
  return (
    <img
      src={sized(src as string, 1600)}
      srcSet={srcSet(src as string)}
      sizes={sizes}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn("transition-opacity duration-700", state === "loading" ? "opacity-0" : "opacity-100", className)}
      onLoad={(e) => {
        setState("ok");
        onLoad?.(e);
      }}
      ref={(el) => {
        if (el?.complete && el.naturalWidth > 0 && state === "loading") setState("ok");
      }}
      onError={() => setState("error")}
      {...rest}
    />
  );
}
