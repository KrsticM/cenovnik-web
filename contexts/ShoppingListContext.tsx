"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  ShoppingList,
  ShoppingListItem,
} from "@/types/shoppingList";
import {
  getOrCreateActiveList,
  fetchListItems,
  addItem as serviceAddItem,
  updateItemQuantity as serviceUpdateQuantity,
  removeItem as serviceRemoveItem,
  clearList as serviceClearList,
} from "@/lib/services/lists";
import { createClient } from "@/lib/supabase/client";

interface ShoppingListContextValue {
  list: ShoppingList | null;
  items: ShoppingListItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  error: string | null;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearList: () => Promise<void>;
  getItemByProductId: (productId: string) => ShoppingListItem | undefined;
}

const ShoppingListContext = createContext<ShoppingListContextValue | null>(null);

export function ShoppingListProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize list and items when user logs in
  useEffect(() => {
    if (!user?.id) {
      setList(null);
      setItems([]);
      setError(null);
      return;
    }

    const initializeList = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get or create the user's active list
        const userList = await getOrCreateActiveList(user.id);
        setList(userList);

        // Fetch existing items
        const listItems = await fetchListItems(userList.id);
        setItems(listItems);

        // Subscribe to realtime updates on shopping_list_items
        const supabase = createClient();
        const subscription = supabase
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
              // Refetch items on any change
              const updatedItems = await fetchListItems(userList.id);
              setItems(updatedItems);
            }
          )
          .subscribe();

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error("Failed to initialize shopping list:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load shopping list"
        );
      } finally {
        setLoading(false);
      }
    };

    const cleanup = initializeList();
    return () => {
      cleanup?.then((fn) => fn?.());
    };
  }, [user?.id]);

  const addItem = async (productId: string, quantity: number = 1) => {
    if (!list) return;
    try {
      await serviceAddItem(list.id, productId, quantity);
      // Refetch to ensure state is fresh
      const updatedItems = await fetchListItems(list.id);
      setItems(updatedItems);
    } catch (err) {
      console.error("Failed to add item:", err);
      setError(err instanceof Error ? err.message : "Failed to add item");
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await serviceUpdateQuantity(itemId, quantity);
      // Update local state immediately for better UX
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    } catch (err) {
      console.error("Failed to update quantity:", err);
      setError(err instanceof Error ? err.message : "Failed to update quantity");
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await serviceRemoveItem(itemId);
      // Update local state immediately
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Failed to remove item:", err);
      setError(err instanceof Error ? err.message : "Failed to remove item");
    }
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

  const getItemByProductId = (productId: string) => {
    return items.find((item) => item.productId === productId);
  };

  const itemCount = items.length;
  const total = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  return (
    <ShoppingListContext.Provider
      value={{
        list,
        items,
        itemCount,
        total,
        loading,
        error,
        addItem,
        updateQuantity,
        removeItem,
        clearList,
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
