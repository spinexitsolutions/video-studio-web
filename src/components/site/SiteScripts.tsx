"use client";

import Script from "next/script";
import { useEffect } from "react";
import type { PublicIntegrations } from "@/lib/integrations";

/** Analytics tags + optional image right-click / drag protection. */
export default function SiteScripts({ cfg }: { cfg: PublicIntegrations }) {
  useEffect(() => {
    if (!cfg.protectImages) return;
    const block = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t?.tagName === "IMG" || t?.closest?.("[data-protect]")) e.preventDefault();
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
    };
  }, [cfg.protectImages]);

  const ga = /^G-[A-Z0-9]+$/i.test(cfg.gaMeasurementId) ? cfg.gaMeasurementId : "";
  const gtm = /^GTM-[A-Z0-9]+$/i.test(cfg.gtmId) ? cfg.gtmId : "";
  const pixel = /^\d+$/.test(cfg.metaPixelId) ? cfg.metaPixelId : "";

  return (
    <>
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');`}</Script>
        </>
      )}
      {gtm && (
        <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}</Script>
      )}
      {pixel && (
        <Script id="fb-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}</Script>
      )}
    </>
  );
}
