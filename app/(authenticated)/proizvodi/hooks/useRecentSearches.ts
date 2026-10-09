import { useCallback, useSyncExternalStore } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createLocalStore } from "@/lib/localStore";

const MAX_RECENT = 5;
const EMPTY: string[] = [];

const recentStore = createLocalStore<string[]>({
  parse: (value) =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, MAX_RECENT) : null,
  empty: EMPTY,
});

// Last searches on this device, per account so a shared computer doesn't mix them.
export function useRecentSearches() {
  const { user } = useAuth();
  const key = `ecenovnik:recent-searches:${user?.id ?? "guest"}`;
  const items = useSyncExternalStore(recentStore.subscribe, () => recentStore.read(key), () => EMPTY);

  const add = useCallback(
    (term: string) => {
      const value = term.trim();
      if (value.length < 2) return;
      const rest = recentStore.read(key).filter((item) => item.toLowerCase() !== value.toLowerCase());
      recentStore.write(key, [value, ...rest].slice(0, MAX_RECENT));
    },
    [key]
  );

  const clear = useCallback(() => recentStore.write(key, null), [key]);

  return { items, add, clear };
}
