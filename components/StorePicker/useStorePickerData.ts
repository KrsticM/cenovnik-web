"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchRetailersWithStores, type Retailer } from "@/lib/services/retailers";
import { getUserStoreIds } from "@/lib/services/userStores";

export type LoadState = "loading" | "ready" | "error";

type Result = { key: string; retailers: Retailer[]; savedIds: string[]; failed: boolean };

const NO_RETAILERS: Retailer[] = [];
const NO_IDS: string[] = [];

// Keyed on user and attempt, so a different user or a retry shows "loading" instead of old data.
export function useStorePickerData(userId: string | null) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const key = userId ? `${userId}|${attempt}` : "";

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    Promise.all([fetchRetailersWithStores(), getUserStoreIds(userId)])
      .then(([retailers, savedIds]) => {
        if (!cancelled) setResult({ key, retailers, savedIds, failed: false });
      })
      .catch((err) => {
        console.error("Failed to load stores:", err);
        if (!cancelled) setResult({ key, retailers: NO_RETAILERS, savedIds: NO_IDS, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [userId, key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const current = result?.key === key ? result : null;
  const loadState: LoadState = !current ? "loading" : current.failed ? "error" : "ready";
  return { loadState, retailers: current?.retailers ?? NO_RETAILERS, savedIds: current?.savedIds ?? NO_IDS, retry };
}
