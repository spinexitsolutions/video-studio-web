/** Client-safe helpers that build responsive image URLs for every image source the CMS supports. */
export const WIDTHS = [480, 800, 1200, 1600, 2400];

export function sized(url: string | undefined, w: number): string {
  if (!url) return "";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace(/\/upload\/(?:[a-z]_[^/]+\/)?/, `/upload/f_auto,q_auto,c_limit,w_${w}/`);
  }
  if (url.includes("images.unsplash.com")) {
    return /[?&]w=\d+/.test(url) ? url.replace(/([?&])w=\d+/, `$1w=${w}`) : `${url}${url.includes("?") ? "&" : "?"}w=${w}`;
  }
  if (url.startsWith("/media/") && /\.(jpe?g|png|webp|avif)$/i.test(url.split("?")[0])) return `${url.split("?")[0]}?w=${w}`;
  return url;
}

export function srcSet(url: string | undefined) {
  if (!url) return undefined;
  const a = sized(url, 480);
  if (a === url) return undefined; // not resizable
  return WIDTHS.map((w) => `${sized(url, w)} ${w}w`).join(", ");
}
