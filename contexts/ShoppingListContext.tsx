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
  addItem as serviceAddItem,
  updateItemQuantity as serviceUpdateQuantity,
  removeItem as serviceRemoveItem,
  clearList as serviceClearList,
  setListShareToken,
  attachPrices,
} from "@/lib/services/lists";
import { getUserStoreIds } from "@/lib/services/userStores";
import { createClient } from "@/lib/supabase/client";

const UNDO_WINDOW_MS = 5000;

export type RemovedItem = {
  productId: string;
  productName: string;
  quantity: number;
};

interface ShoppingListContextValue {
  list: ShoppingList | null;
  items: ShoppingListItem[];
  itemCount: number;
  total: number;
  storeIds: string[];
  loading: boolean;
  error: string | null;
  lastRemoved: RemovedItem | null;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  undoRemove: () => Promise<void>;
  clearList: () => Promise<void>;
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
  const [lastRemoved, setLastRemoved] = useState<RemovedItem | null>(null);
  const storeIdsRef = useRef<string[]>([]);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadItems = useCallback(
    async (listId: string) => attachPrices(await fetchListItems(listId), storeIdsRef.current),
    []
  );

  useEffect(() => {
    if (!user?.id) {
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
            async () => {
              const updatedItems = await loadItems(userList.id);
              if (!cancelled) setItems(updatedItems);
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
  }, [user?.id, loadItems]);

  useEffect(() => () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  }, []);

  const addItem = async (productId: string, quantity: number = 1) => {
    if (!list) return;
    try {
      await serviceAddItem(list.id, productId, quantity);
      setItems(await loadItems(list.id));
    } catch (err) {
      console.error("Failed to add item:", err);
      setError(err instanceof Error ? err.message : "Failed to add item");
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await serviceUpdateQuantity(itemId, quantity);
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
      );
    } catch (err) {
      console.error("Failed to update quantity:", err);
      setError(err instanceof Error ? err.message : "Failed to update quantity");
    }
  };

  const removeItem = async (itemId: string) => {
    const removed = items.find((item) => item.id === itemId);
    try {
      await serviceRemoveItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      if (removed) {
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        setLastRemoved({
          productId: removed.productId,
          productName: removed.productName,
          quantity: removed.quantity,
        });
        undoTimerRef.current = setTimeout(() => setLastRemoved(null), UNDO_WINDOW_MS);
      }
    } catch (err) {
      console.error("Failed to remove item:", err);
      setError(err instanceof Error ? err.message : "Failed to remove item");
    }
  };

  const undoRemove = async () => {
    if (!lastRemoved) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const { productId, quantity } = lastRemoved;
    setLastRemoved(null);
    await addItem(productId, quantity);
  };

  const clearList = async () => {
    if (!list) return;
    try {
      await serviceClearList(list.id);
      setItems([]);
    } catch (err) {
      console.error("Failed to clear list:", err);
      setError(err instanceof Error ? err.message : "Failed to clear list");
    }
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
        addItem,
        updateQuantity,
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
