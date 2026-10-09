"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { ShoppingList, ShoppingListItem } from "@/types/shoppingList";
import {
  getOrCreateActiveList,
  fetchListItems,
  setItemQuantity as serviceSetQuantity,
  removeItem as serviceRemoveItem,
  clearList as serviceClearList,
  setListShareToken,
  attachPrices,
} from "@/lib/services/lists";
import { getUserStoreIds } from "@/lib/services/userStores";
import { createClient } from "@/lib/supabase/client";

export const UNDO_WINDOW_MS = 5000;
const RELOAD_DEBOUNCE_MS = 200;

// What a caller already knows about a product, so a newly added item renders right away.
export type ItemDetails = Partial<Pick<ShoppingListItem, "productName" | "primaryBarcode" | "hasImage" | "price">>;

interface ShoppingListContextValue {
  list: ShoppingList | null;
  items: ShoppingListItem[];
  itemCount: number;
  total: number;
  storeIds: string[];
  loading: boolean;
  error: string | null;
  lastRemoved: ShoppingListItem | null;
  // Quantity 0 removes the item. Changes show immediately and are saved in order.
  setQuantity: (productId: string, quantity: number, details?: ItemDetails) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  undoRemove: () => Promise<void>;
  clearList: () => Promise<void>;
  setSharing: (isPublic: boolean) => Promise<void>;
  getItemByProductId: (productId: string) => ShoppingListItem | undefined;
}

const ShoppingListContext = createContext<ShoppingListContextValue | null>(null);

// Keyed by user, so signing out or switching user starts from an empty list instead of the previous one.
export function ShoppingListProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return <UserShoppingList key={user?.id ?? "signed-out"}>{children}</UserShoppingList>;
}

function UserShoppingList({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [storeIds, setStoreIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRemoved, setLastRemoved] = useState<ShoppingListItem | null>(null);
  const storeIdsRef = useRef<string[]>([]);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listIdRef = useRef<string | null>(null);
  // Saves run one after another so the database ends in the same state as the screen.
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const pendingSavesRef = useRef(0);
  const reloadSeqRef = useRef(0);
  const itemsRef = useRef<ShoppingListItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const loadItems = useCallback(
    async (listId: string) => attachPrices(await fetchListItems(listId), storeIdsRef.current),
    []
  );

  // Only the newest reload applies, and never while saves are pending, so out-of-order reloads can't undo changes.
  const reload = useCallback(
    async (listId: string) => {
      const seq = ++reloadSeqRef.current;
      try {
        const next = await loadItems(listId);
        if (seq === reloadSeqRef.current && pendingSavesRef.current === 0 && listIdRef.current === listId) {
          setItems(next);
        }
      } catch (err) {
        console.error("Failed to reload shopping list:", err);
      }
    },
    [loadItems]
  );

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let reloadTimer: ReturnType<typeof setTimeout> | undefined;

    const initializeList = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userList, userStoreIds] = await Promise.all([
          getOrCreateActiveList(user.id),
          getUserStoreIds(user.id),
        ]);
        if (cancelled) return;
        storeIdsRef.current = userStoreIds;
        listIdRef.current = userList.id;
        setStoreIds(userStoreIds);
        setList(userList);

        const listItems = await loadItems(userList.id);
        if (cancelled) return;
        setItems(listItems);

        channel = supabase
          .channel(`shopping_list:${userList.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "shopping_list_items",
              filter: `shopping_list_id=eq.${userList.id}`,
            },
            (payload) => {
              if (cancelled) return;
              // Same quantity = only a shared-list tick, which the owner list doesn't show.
              if (payload.eventType === "UPDATE") {
                const row = payload.new as { id?: string; quantity?: number };
                const shown = itemsRef.current.find((item) => item.id === row.id);
                if (shown && shown.quantity === row.quantity) return;
              }
              clearTimeout(reloadTimer);
              reloadTimer = setTimeout(() => {
                if (!cancelled) void reload(userList.id);
              }, RELOAD_DEBOUNCE_MS);
            }
          )
          .subscribe();
      } catch (err) {
        console.error("Failed to initialize shopping list:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load shopping list");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initializeList();
    return () => {
      cancelled = true;
      clearTimeout(reloadTimer);
      channel?.unsubscribe();
    };
  }, [user?.id, loadItems, reload]);

  useEffect(() => () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  }, []);

  // Updates the screen first, then queues the write; one reload once idle brings in server data and undoes failed saves.
  const save = (listId: string, write: () => Promise<void>, failure: string) => {
    pendingSavesRef.current += 1;
    reloadSeqRef.current += 1; // a reload already in flight read the list before this change
    saveQueueRef.current = saveQueueRef.current
      .then(write)
      .catch((err) => {
        console.error(`${failure}:`, err);
        setError(err instanceof Error ? err.message : failure);
      })
      .finally(() => {
        pendingSavesRef.current -= 1;
        if (pendingSavesRef.current === 0) reload(listId);
      });
    return saveQueueRef.current;
  };

  const removeItem = async (productId: string) => {
    const removed = items.find((item) => item.productId === productId);
    if (!list || !removed) return;
    setItems((prev) => prev.filter((item) => item.productId !== productId));
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setLastRemoved(removed);
    undoTimerRef.current = setTimeout(() => setLastRemoved(null), UNDO_WINDOW_MS);
    await save(list.id, () => serviceRemoveItem(list.id, productId), "Failed to remove item");
  };

  const setQuantity = async (productId: string, quantity: number, details: ItemDetails = {}) => {
    if (!list) return;
    if (quantity <= 0) return removeItem(productId);
    const listId = list.id;
    setItems((prev) =>
      prev.some((item) => item.productId === productId)
        ? prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
        : [
            ...prev,
            {
              // Placeholder until the reload after saving brings the real row.
              id: `pending:${productId}`,
              shoppingListId: listId,
              productId,
              productName: details.productName ?? "",
              primaryBarcode: details.primaryBarcode ?? null,
              hasImage: details.hasImage ?? false,
              price: details.price ?? null,
              quantity,
              checkedAt: null,
              createdAt: new Date().toISOString(),
            },
          ]
    );
    await save(listId, () => serviceSetQuantity(listId, productId, quantity), "Failed to update quantity");
  };

  const undoRemove = async () => {
    if (!lastRemoved) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const { productId, quantity } = lastRemoved;
    setLastRemoved(null);
    await setQuantity(productId, quantity, lastRemoved);
  };

  const clearList = async () => {
    if (!list) return;
    const listId = list.id;
    setItems([]);
    await save(listId, () => serviceClearList(listId), "Failed to clear list");
  };

  const setSharing = async (isPublic: boolean) => {
    if (!list) return;
    try {
      const token = isPublic ? list.shareToken ?? crypto.randomUUID() : null;
      setList(await setListShareToken(list.id, token));
    } catch (err) {
      console.error("Failed to update sharing:", err);
      setError(err instanceof Error ? err.message : "Failed to update sharing");
    }
  };

  const getItemByProductId = (productId: string) =>
    items.find((item) => item.productId === productId);

  const total = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  return (
    <ShoppingListContext.Provider
      value={{
        list,
        items,
        itemCount: items.length,
        total,
        storeIds,
        loading,
        error,
        lastRemoved,
        setQuantity,
        removeItem,
        undoRemove,
        clearList,
        setSharing,
        getItemByProductId,
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingList(): ShoppingListContextValue {
  const context = useContext(ShoppingListContext);
  if (!context) {
    throw new Error("useShoppingList must be used within ShoppingListProvider");
  }
  return context;
}

export function useFavouriteStores(): { storeIds: string[]; ready: boolean; failed: boolean } {
  const { list, error, storeIds } = useShoppingList();
  const failed = list === null && error !== null;
  return { storeIds, ready: list !== null || failed, failed };
}
