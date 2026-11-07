"use client";

import { shouldShowAds } from "@/lib/ads";
import { usePremium } from "./usePremium";

export function useShowAds(): boolean {
  return shouldShowAds(usePremium());
}
