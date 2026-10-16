"use client";

import { useCallback, useEffect, useState } from "react";
import { subscriptionStateFrom, type SubscriptionState } from "@/lib/subscription";

export type { SubscriptionState };

// `details: false` asks the server for the Premium flag only, which is cheaper when the plan is not shown.
export function useSubscription(enabled = true, { details = true } = {}) {
  const [state, setState] = useState<SubscriptionState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch(details ? "/api/pretplata" : "/api/pretplata?details=0")
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => !cancelled && setState(subscriptionStateFrom(body)))
      .catch(() => !cancelled && setState({ status: "unknown" }));
    return () => {
      cancelled = true;
      // The next open must not start from the last answer.
      setState({ status: "loading" });
    };
  }, [enabled, details, attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}
