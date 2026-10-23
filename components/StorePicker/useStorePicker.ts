"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { saveUserStoreIds } from "@/lib/services/userStores";
import { MIN_STORES, storeLimit } from "@/lib/storeLimits";
import { usePremium } from "@/hooks/usePremium";
import { buildChainRows, isDirty, limitText, saveHint, saveLabel, toggleStoreSelection, toggled } from "./storePickerModel";
import { useStorePickerData } from "./useStorePickerData";

// The user's changes on top of what was loaded; dropped when the data reloads.
type Edit = { base: string[]; picked: Set<string>; pinned: Set<string> };

export function useStorePicker(userId: string | null) {
  const isPremium = usePremium(userId !== null);
  const limit = storeLimit(isPremium);
  const { loadState, retailers, savedIds, retry } = useStorePickerData(userId);
  const [edit, setEdit] = useState<Edit | null>(null);
  const [openChains, setOpenChains] = useState<Set<string>>(new Set());
  const [searchClosed, setSearchClosed] = useState<Set<string>>(new Set());
  const [query, setQueryState] = useState("");
  const [searchMode, setSearchMode] = useState(false);
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
      setSearchClosed(new Set());
      change({ pinned: new Set(picked) });
    },
    [change, picked]
  );

  // On a phone a tapped search takes the whole dialog, so the intro makes room for the results. A tap, not focus: the dialog focuses the field by itself when it opens.
  const startSearch = useCallback(() => {
    if (window.matchMedia("(max-width: 639px)").matches) setSearchMode(true);
  }, []);

  const exitSearch = useCallback(() => {
    setSearchMode(false);
    setQuery("");
  }, [setQuery]);

  // Leaving the phone layout (rotation, resize) ends it, and Escape leaves it before it would close the dialog.
  useEffect(() => {
    if (!searchMode) return;
    const phone = window.matchMedia("(max-width: 639px)");
    const onResize = () => {
      if (!phone.matches) setSearchMode(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      event.preventDefault();
      exitSearch();
    };
    phone.addEventListener("change", onResize);
    window.addEventListener("keydown", onKey, true);
    return () => {
      phone.removeEventListener("change", onResize);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [searchMode, exitSearch]);

  const toggleChain = useCallback(
    (chainId: string) => {
      change({ pinned: new Set(picked) });
      if (query.trim()) setSearchClosed((closed) => toggled(closed, chainId));
      else setOpenChains((open) => toggled(open, chainId));
    },
    [change, picked, query]
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
      // Stays "saving" on success: the caller reloads the page, and the buttons must not wake up before that.
      return true;
    } catch (err) {
      console.error("Failed to save stores:", err);
      setSaveError("Nismo uspeli da sačuvamo markete. Pokušaj ponovo.");
      setSaving(false);
      return false;
    }
  }, [userId, picked, saving]);

  const discard = useCallback(() => {
    if (saving) return;
    setSaveError(null);
    setEdit(null);
  }, [saving]);

  const dirty = isDirty(picked, saved);

  const rows = useMemo(
    () => buildChainRows({ retailers, query, picked, pinned, openChains, searchClosed, limit }),
    [retailers, query, picked, pinned, openChains, searchClosed, limit]
  );

  return {
    loadState,
    retry,
    isNewAccount: loadState === "ready" && savedIds.length === 0,
    query,
    setQuery,
    rows,
    searchMode,
    startSearch,
    exitSearch,
    toggleChain,
    toggleStore,
    atLimit: picked.size >= limit,
    limitText: limitText(limit),
    showUpsell: isPremium === false,
    dirty,
    // A failed save keeps the buttons so the user can retry or undo.
    showActions: dirty || saving || saveError !== null,
    discard,
    canSave: picked.size >= MIN_STORES && !saving,
    saving,
    saveLabel: saveLabel(picked.size, saving),
    saveHint: saveError ?? saveHint(retailers, picked),
    saveFailed: saveError !== null,
    save,
  };
}

export type StorePickerState = ReturnType<typeof useStorePicker>;
