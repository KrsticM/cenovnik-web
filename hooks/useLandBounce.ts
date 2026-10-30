"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Matches the 280ms panel/menu exit, so the button bounces once the overlay is gone.
const EXIT_MS = 290;
const HOLD_MS = 420;

// The button an overlay closed into grows briefly, so the eye follows where it went.
export function useLandBounce() {
  const [landing, setLanding] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const bounce = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    clear();
    timers.current.push(
      setTimeout(() => setLanding(true), EXIT_MS),
      setTimeout(() => setLanding(false), EXIT_MS + HOLD_MS)
    );
  }, []);

  useEffect(() => clear, []);

  return { landing, bounce };
}
