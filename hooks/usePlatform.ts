"use client";

import { useSyncExternalStore } from "react";
import { platformFrom, type Platform } from "@/lib/platform";

export type { Platform };

const subscribe = () => () => {};
const detect = () => platformFrom(navigator.userAgent, navigator.maxTouchPoints);

// "other" on the server and during hydration, so both stores show until the browser is known.
export function usePlatform(): Platform {
  return useSyncExternalStore(subscribe, detect, () => "other");
}
