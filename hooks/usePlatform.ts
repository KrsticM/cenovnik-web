"use client";

import { useSyncExternalStore } from "react";

export type Platform = "ios" | "android" | "other";

const subscribe = () => () => {};
const detect = (): Platform => {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) ? "ios" : /Android/.test(ua) ? "android" : "other";
};

// "other" on the server and during hydration, so both stores show until the browser is known.
export function usePlatform(): Platform {
  return useSyncExternalStore(subscribe, detect, () => "other");
}
