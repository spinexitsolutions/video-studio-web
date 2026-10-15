import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSingleton } from "@/lib/db";
import { googleFontsHref, themeVars } from "@/lib/themes";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = getSingleton("settings");
  const pages = getSingleton("pages");
  const title = pages.home_metaTitle || s.metaTitle || s.siteName;
  const description = pages.home_metaDescription || s.metaDescription;
  const image = pages.home_ogImage || s.ogImage;
  return {
    metadataBase: pages.siteUrl ? new URL(pages.siteUrl) : undefined,
    title: { default: title, template: `%s — ${s.siteName}` },
    description,
    keywords: s.keywords,
    openGraph: { title, description, images: image ? [image] : [], type: "website", siteName: s.siteName },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
    icons: { icon: "/icon.svg" },
    verification: pages.googleVerification ? { google: pages.googleVerification } : undefined,
    robots: pages.noindex === "true" ? { index: false, follow: false } : undefined,
  };
}

export async function generateViewport(): Promise<Viewport> {
  const { dark, vars } = themeVars(getSingleton("theme"));
  return { themeColor: dark ? `rgb(${vars["--ink"]})` : `rgb(${vars["--ink"]})`, width: "device-width", initialScale: 1 };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = getSingleton("theme");
  const { dark, vars } = themeVars(theme);
  return (
    <html lang="en" style={vars as React.CSSProperties} data-theme={dark ? "dark" : "light"} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={googleFontsHref(theme)} rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
