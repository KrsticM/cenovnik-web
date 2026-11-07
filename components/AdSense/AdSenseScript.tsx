import Script from "next/script";
import { ADSENSE_CLIENT } from "@/lib/ads";

export function AdSenseScript() {
  return (
    <Script
      id="adsense"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}
