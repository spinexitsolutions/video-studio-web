import { clsx, type ClassValue } from "clsx";

export const cn = (...v: ClassValue[]) => clsx(v);

export function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec((hex || "").trim());
  if (!m) return "255 122 69";
  return `${parseInt(m[1], 16)} ${parseInt(m[2], 16)} ${parseInt(m[3], 16)}`;
}

export type VideoSource = { type: "youtube" | "vimeo" | "file"; src: string } | null;

export function parseVideo(url: string | undefined): VideoSource {
  if (!url) return null;
  const yt = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/.exec(url);
  if (yt) return { type: "youtube", src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0&modestbranding=1` };
  const vm = /vimeo\.com\/(?:video\/)?(\d+)/.exec(url);
  if (vm) return { type: "vimeo", src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1&title=0&byline=0` };
  return { type: "file", src: url };
}

export function formatDate(d: string) {
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function readingTime(text: string) {
  return Math.max(1, Math.round((text || "").split(/\s+/).length / 220));
}
