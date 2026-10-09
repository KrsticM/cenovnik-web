"use client";

import { useCallback, useMemo, useState } from "react";
import { saveUserStoreIds } from "@/lib/services/userStores";
import { MIN_STORES, storeLimit } from "@/lib/storeLimits";
import { usePremium } from "@/hooks/usePremium";
import { buildChainRows, buildPickedChips, limitText, saveHint, saveLabel, toggleStoreSelection, toggled } from "./storePickerModel";
import { useStorePickerData } from "./useStorePickerData";

// The user's changes on top of what was loaded; dropped when the data reloads.
type Edit = { base: string[]; picked: Set<string>; pinned: Set<string> };

export function useStorePicker(userId: string | null) {
  const isPremium = usePremium(userId !== null);
  const limit = storeLimit(isPremium);
  const { loadState, retailers, savedIds, retry } = useStorePickerData(userId);
  const [edit, setEdit] = useState<Edit | null>(null);
  const [openChains, setOpenChains] = useState<Set<string>>(new Set());
  const [query, setQueryState] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saved = useMemo(() => new Set(savedIds), [savedIds]);
  const current = edit?.base === savedIds ? edit : null;
  const picked = current?.picked ?? saved;
  const pinned = current?.pinned ?? saved;

  const change = useCallback(
    (next: Partial<Pick<Edit, "picked" | "pinned">>) => setEdit({ base: savedIds, picked, pinned, ...next }),
    [savedIds, picked, pinned]
  );

  const setQuery = useCallback(
    (value: string) => {
      setQueryState(value);
      change({ pinned: new Set(picked) });
    },
    [change, picked]
  );

  const toggleChain = useCallback(
    (chainId: string) => {
      change({ pinned: new Set(picked) });
      setOpenChains((open) => toggled(open, chainId));
    },
    [change, picked]
  );

  const toggleStore = useCallback(
    (storeId: string) => {
      setSaveError(null);
      change({ picked: toggleStoreSelection(picked, storeId, limit) });
    },
    [change, picked, limit]
  );

  const save = useCallback(async (): Promise<boolean> => {
    if (!userId || picked.size < MIN_STORES || saving) return false;
    setSaving(true);
    setSaveError(null);
    try {
      await saveUserStoreIds(userId, [...picked]);
      return true;
    } catch (err) {
      console.error("Failed to save stores:", err);
      setSaveError("Nismo uspeli da sačuvamo markete. Pokušaj ponovo.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, picked, saving]);

  const rows = useMemo(
    () => buildChainRows({ retailers, query, picked, pinned, openChains, limit }),
    [retailers, query, picked, pinned, openChains, limit]
  );
  const chips = useMemo(() => buildPickedChips(retailers, picked), [retailers, picked]);

  return {
    loadState,
    retry,
    isNewAccount: loadState === "ready" && savedIds.length === 0,
    query,
    setQuery,
    rows,
    chips,
    toggleChain,
    toggleStore,
    atLimit: picked.size >= limit,
    limitText: limitText(limit),
    showUpsell: isPremium === false,
    canSave: picked.size >= MIN_STORES && !saving,
    saving,
    saveLabel: saveLabel(picked.size, saving),
    saveHint: saveError ?? saveHint(retailers, picked),
    saveFailed: saveError !== null,
    save,
  };
}

export type StorePickerState = ReturnType<typeof useStorePicker>;
