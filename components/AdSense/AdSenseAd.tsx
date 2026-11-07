"use client";

import { useEffect, useRef, useState } from "react";
import { AdSlot } from "@/components/ui/ad-slot";
import { ADSENSE_CLIENT, type AdSize } from "@/lib/ads";

interface AdSenseAdProps {
  slot: string;
  size: AdSize;
  className?: string;
}

export function AdSenseAd({ slot, size, className }: AdSenseAdProps) {
  // A loaded ad keeps its size; resizing the window must not request a new one.
  const [{ width, height }] = useState(size);
  const pushed = useRef(false);

  useEffect(() => {
    // React's dev double effect runs before the script marks the slot, so remember the push ourselves.
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("[AdSenseAd] push failed", err);
    }
  }, []);

  return (
    <AdSlot width={width} height={height} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "inline-block", width, height }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-adtest={process.env.NODE_ENV === "production" ? undefined : "on"}
      />
    </AdSlot>
  );
}
