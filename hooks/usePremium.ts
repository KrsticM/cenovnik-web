"use client";

import { useEffect, useState } from "react";

// null until the check answers, and if it fails: "unknown" must never be read as Standard.
export function usePremium(enabled = true): boolean | null {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch("/api/pretplata")
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { isPremium?: boolean | null } | null) => {
        if (!cancelled && typeof body?.isPremium === "boolean") setIsPremium(body.isPremium);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return isPremium;
}
