import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSingleton } from "@/lib/db";
import { hexToRgb } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = getSingleton("settings");
  return {
    title: { default: s.metaTitle || s.siteName, template: `%s — ${s.siteName}` },
    description: s.metaDescription,
    keywords: s.keywords,
    openGraph: {
      title: s.metaTitle || s.siteName,
      description: s.metaDescription,
      images: s.ogImage ? [s.ogImage] : [],
      type: "website",
      siteName: s.siteName,
    },
    twitter: { card: "summary_large_image", title: s.metaTitle, description: s.metaDescription, images: s.ogImage ? [s.ogImage] : [] },
    icons: { icon: "/icon.svg" },
  };
}

export const viewport: Viewport = { themeColor: "#050506", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const s = getSingleton("settings");
  const style = { "--accent": s.accentColor, "--accent-rgb": hexToRgb(s.accentColor) } as React.CSSProperties;
  return (
    <html lang="en" style={style} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300..800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
