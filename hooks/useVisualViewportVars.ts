"use client";

import { useEffect } from "react";

// While `active`, publishes the visible part of the screen as --vvh (height) and --vvt (offset from the top).
// It shrinks when the on-screen keyboard opens on every phone (iOS Safari and Android Chrome alike),
// so a full-screen dialog can follow it and keep its bottom button above the keyboard.
export function useVisualViewportVars(active: boolean) {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!active || !viewport) return;
    const root = document.documentElement;
    const update = () => {
      root.style.setProperty("--vvh", `${viewport.height}px`);
      root.style.setProperty("--vvt", `${viewport.offsetTop}px`);
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      root.style.removeProperty("--vvh");
      root.style.removeProperty("--vvt");
    };
  }, [active]);
}
