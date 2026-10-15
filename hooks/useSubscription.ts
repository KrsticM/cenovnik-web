"use client";

import { useCallback, useEffect, useState } from "react";
import { subscriptionStateFrom, type SubscriptionState } from "@/lib/subscription";

export type { SubscriptionState };

export function useSubscription(enabled = true) {
  const [state, setState] = useState<SubscriptionState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch("/api/pretplata")
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => !cancelled && setState(subscriptionStateFrom(body)))
      .catch(() => !cancelled && setState({ status: "unknown" }));
    return () => {
      cancelled = true;
    };
  }, [enabled, attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}
