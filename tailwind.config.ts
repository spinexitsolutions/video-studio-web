import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#050506", 50: "#0b0b0d", 100: "#111114", 200: "#18181c", 300: "#222228", 400: "#2e2e36" },
        paper: { DEFAULT: "#f5f5f7", dim: "#d2d2d7" },
        muted: "#86868b",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["Instrument Serif", "New York", "Iowan Old Style", "Georgia", "serif"],
        mono: ["JetBrains Mono", "SF Mono", "ui-monospace", "Menlo", "monospace"],
      },
      letterSpacing: { tightest: "-0.055em" },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.15" } },
        kenburns: { from: { transform: "scale(1.15) translate3d(0,0,0)" }, to: { transform: "scale(1) translate3d(-1.5%, -1%, 0)" } },
        grain: {
          "0%,100%": { transform: "translate(0,0)" },
          "10%": { transform: "translate(-5%,-10%)" },
          "30%": { transform: "translate(3%,-15%)" },
          "50%": { transform: "translate(12%,9%)" },
          "70%": { transform: "translate(9%,4%)" },
          "90%": { transform: "translate(-1%,7%)" },
        },
        spinSlow: { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        marquee: "marquee var(--marquee-duration, 40s) linear infinite",
        blink: "blink 1.2s steps(2, start) infinite",
        kenburns: "kenburns 9s ease-out forwards",
        grain: "grain 8s steps(10) infinite",
        "spin-slow": "spinSlow 18s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
