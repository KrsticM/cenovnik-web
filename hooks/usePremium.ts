"use client";

import { useSubscription } from "./useSubscription";

// null until the check answers, and if it fails: "unknown" must never be read as Standard.
export function usePremium(enabled = true): boolean | null {
  const { state } = useSubscription(enabled);
  return state.status === "premium" ? true : state.status === "standard" ? false : null;
}
