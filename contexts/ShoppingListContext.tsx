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
  clearCheckedItems as serviceClearChecked,
  setListShareToken,
  attachPrices,
} from "@/lib/services/lists";
import { getUserStoreIds } from "@/lib/services/userStores";
import { createClient } from "@/lib/supabase/client";

export const UNDO_WINDOW_MS = 5000;

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
  // Unticks everything bought on the shared list.
  clearChecked: () => Promise<void>;
  setSharing: (isPublic: boolean) => Promise<void>;
  getItemByProductId: (productId: string) => ShoppingListItem | undefined;
}

const ShoppingListContext = createContext<ShoppingListContextValue | null>(null);

export function ShoppingListProvider({ children }: { children: React.ReactNode }) {
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

  const loadItems = useCallback(
    async (listId: string) => attachPrices(await fetchListItems(listId), storeIdsRef.current),
    []
  );

  // Reloads can finish out of order (realtime fires once per write). Only the newest one is
  // applied, and never while local changes are still saving, so the screen can't jump back.
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
    if (!user?.id) {
      listIdRef.current = null;
      setList(null);
      setItems([]);
      setStoreIds([]);
      setError(null);
      return;
    }

    let cancelled = false;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

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
            () => {
              if (!cancelled) reload(userList.id);
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
      channel?.unsubscribe();
    };
  }, [user?.id, loadItems, reload]);

  useEffect(() => () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  }, []);

  // Applies a change on screen first, then queues the write. Once the queue is idle, one reload
  // brings in server data (ids, prices) and undoes anything that failed to save.
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

  const clearChecked = async () => {
    if (!list) return;
    const listId = list.id;
    setItems((prev) => prev.map((item) => (item.checkedAt ? { ...item, checkedAt: null } : item)));
    await save(listId, () => serviceClearChecked(listId), "Failed to clear bought items");
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
        clearChecked,
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
