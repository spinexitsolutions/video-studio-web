/** Theme presets. Every colour is an "R G B" triplet so Tailwind alpha modifiers keep working. */
export interface ThemeTokens {
  label: string;
  description: string;
  dark: boolean;
  accent: string;
  onAccent: string;
  ink: [string, string, string, string, string, string]; // DEFAULT, 50, 100, 200, 300, 400
  paper: string;
  paperDim: string;
  muted: string;
}

export const THEMES: Record<string, ThemeTokens> = {
  midnight: {
    label: "Midnight",
    description: "Cinematic near-black with a warm accent (default).",
    dark: true,
    accent: "#ff7a45",
    onAccent: "0 0 0",
    ink: ["5 5 6", "11 11 13", "17 17 20", "24 24 28", "34 34 40", "46 46 54"],
    paper: "245 245 247",
    paperDim: "210 210 215",
    muted: "134 134 139",
  },
  noir: {
    label: "Noir",
    description: "Pure black & white, gallery-like and minimal.",
    dark: true,
    accent: "#f5f5f7",
    onAccent: "0 0 0",
    ink: ["0 0 0", "8 8 8", "14 14 14", "22 22 22", "32 32 32", "44 44 44"],
    paper: "250 250 250",
    paperDim: "205 205 205",
    muted: "128 128 128",
  },
  cinema: {
    label: "Cinema Gold",
    description: "Warm espresso tones with a golden accent.",
    dark: true,
    accent: "#e8b04a",
    onAccent: "20 12 0",
    ink: ["13 10 8", "20 16 13", "27 22 18", "36 30 25", "48 40 34", "62 52 44"],
    paper: "246 239 228",
    paperDim: "214 204 190",
    muted: "150 138 122",
  },
  ocean: {
    label: "Ocean",
    description: "Deep navy with an electric blue accent.",
    dark: true,
    accent: "#2997ff",
    onAccent: "0 0 0",
    ink: ["5 9 18", "10 15 27", "15 21 36", "22 30 48", "32 42 64", "44 56 82"],
    paper: "238 243 252",
    paperDim: "200 210 228",
    muted: "128 142 168",
  },
  forest: {
    label: "Forest",
    description: "Earthy dark green with a fresh sage accent.",
    dark: true,
    accent: "#8fd19e",
    onAccent: "0 20 6",
    ink: ["6 10 8", "11 16 13", "16 23 19", "23 31 26", "33 43 37", "45 57 49"],
    paper: "236 244 238",
    paperDim: "200 214 204",
    muted: "126 145 132",
  },
  ivory: {
    label: "Ivory",
    description: "Bright, airy editorial look on warm white.",
    dark: false,
    accent: "#c2410c",
    onAccent: "255 255 255",
    ink: ["250 248 245", "244 241 236", "255 255 255", "236 231 224", "222 215 205", "206 198 186"],
    paper: "20 20 20",
    paperDim: "58 58 58",
    muted: "117 112 106",
  },
  blush: {
    label: "Blush",
    description: "Soft light pink — perfect for wedding studios.",
    dark: false,
    accent: "#d9467a",
    onAccent: "255 255 255",
    ink: ["251 246 244", "246 238 235", "255 255 255", "240 228 224", "228 212 207", "212 194 188"],
    paper: "34 20 22",
    paperDim: "74 54 58",
    muted: "128 106 110",
  },
};

export const SANS_FONTS = ["Inter", "Manrope", "DM Sans", "Plus Jakarta Sans", "Outfit", "Sora", "Poppins", "Space Grotesk"];
export const DISPLAY_FONTS = ["Inter", "Manrope", "Space Grotesk", "Syne", "Bricolage Grotesque", "Playfair Display", "Sora", "Outfit"];
export const SERIF_FONTS = ["Instrument Serif", "Playfair Display", "Cormorant Garamond", "DM Serif Display", "Fraunces", "Libre Caslon Text"];

export const RADIUS = { sharp: { r: "0.25", btn: "8px" }, soft: { r: "1", btn: "9999px" }, round: { r: "1.35", btn: "9999px" } };

const hexToTriplet = (hex: string) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec((hex || "").trim());
  return m ? `${parseInt(m[1], 16)} ${parseInt(m[2], 16)} ${parseInt(m[3], 16)}` : null;
};

/** Pick black or white text for a given accent colour. */
function readableOn(hex: string, fallback: string) {
  const t = hexToTriplet(hex);
  if (!t) return fallback;
  const [r, g, b] = t.split(" ").map(Number);
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return l > 0.6 ? "0 0 0" : "255 255 255";
}

export function themeVars(theme: { preset?: string; accent?: string; fontSans?: string; fontDisplay?: string; fontSerif?: string; radius?: string }) {
  const t = THEMES[theme.preset || "midnight"] || THEMES.midnight;
  const accent = theme.accent || t.accent;
  const accentRgb = hexToTriplet(accent) || hexToTriplet(t.accent)!;
  const radius = RADIUS[(theme.radius as keyof typeof RADIUS) || "soft"] || RADIUS.soft;
  const q = (f?: string) => (f ? `"${f}", ` : "");
  return {
    dark: t.dark,
    vars: {
      "--accent": accent,
      "--accent-rgb": accentRgb,
      "--on-accent": theme.accent ? readableOn(accent, t.onAccent) : t.onAccent,
      "--ink": t.ink[0],
      "--ink-50": t.ink[1],
      "--ink-100": t.ink[2],
      "--ink-200": t.ink[3],
      "--ink-300": t.ink[4],
      "--ink-400": t.ink[5],
      "--paper": t.paper,
      "--paper-dim": t.paperDim,
      "--muted": t.muted,
      "--rs": radius.r,
      "--btn-radius": radius.btn,
      "--font-sans": `${q(theme.fontSans)}-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
      "--font-display": `${q(theme.fontDisplay || theme.fontSans)}-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
      "--font-serif": `${q(theme.fontSerif)}"New York", Georgia, serif`,
    } as Record<string, string>,
  };
}

export function googleFontsHref(theme: { fontSans?: string; fontDisplay?: string; fontSerif?: string }) {
  const fams = new Set<string>();
  const add = (f?: string, spec = ":wght@300;400;500;600;700;800") => f && fams.add(`family=${f.replace(/ /g, "+")}${spec}`);
  add(theme.fontSans);
  if (theme.fontDisplay && theme.fontDisplay !== theme.fontSans) add(theme.fontDisplay);
  add(theme.fontSerif, theme.fontSerif === "Instrument Serif" || theme.fontSerif === "DM Serif Display" ? ":ital@0;1" : ":ital,wght@0,400;1,400");
  fams.add("family=JetBrains+Mono:wght@400;500");
  return `https://fonts.googleapis.com/css2?${[...fams].join("&")}&display=swap`;
}
