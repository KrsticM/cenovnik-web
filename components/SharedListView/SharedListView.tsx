"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ListHeader } from "../ListHeader/ListHeader";
import { ListCard } from "../ListCard/ListCard";
import { ListItem } from "../ListItem/ListItem";
import { ImageModal } from "../ImageModal/ImageModal";
import { LoadingState } from "../StateShells/LoadingState";
import { ErrorState } from "../StateShells/ErrorState";
import { EmptyState } from "../StateShells/EmptyState";
import styles from "./SharedListView.module.css";

type Item = {
  productId: string;
  productName: string;
  primaryBarcode: string;
  quantity: number;
};

type ShoppingList = {
  id: string;
  name: string;
  items: Item[];
};

type RealtimeConfig = {
  url: string;
  anonKey: string;
};

interface SharedListViewProps {
  token: string;
}

export function SharedListView({ token }: SharedListViewProps) {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<{ name: string; barcode: string } | null>(null);
  const [realtimeConfig, setRealtimeConfig] = useState<RealtimeConfig | null>(null);

  const load = useCallback(async (background = false) => {
    if (!background) setLoading(true);
    try {
      const response = await fetch(`/api/lista/${encodeURIComponent(token)}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Lista trenutno nije dostupna.");
      }
      setList(data);
      setRealtimeConfig(data.realtime);
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Lista trenutno nije dostupna."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load list on mount
  useEffect(() => {
    void load();
  }, [load]);

  // Setup real-time subscription
  useEffect(() => {
    if (!list?.id || !realtimeConfig) return;

    const supabase = createClient(realtimeConfig.url, realtimeConfig.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const channel = supabase
      .channel(`shared-list:${list.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_list_items",
          filter: `shopping_list_id=eq.${list.id}`,
        },
        () => void load(true)
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shopping_lists",
          filter: `id=eq.${list.id}`,
        },
        () => void load(true)
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [list?.id, realtimeConfig, load]);

  // Restore checked items from localStorage
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`ecenovnik-list:${token}`);
      if (saved) {
        setCheckedItems(new Set(JSON.parse(saved) as string[]));
      }
    } catch {
      setCheckedItems(new Set());
    }
  }, [token]);

  // Handle close modal on escape
  useEffect(() => {
    if (!preview) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreview(null);
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [preview]);

  const toggleItem = (productId: string) => {
    setCheckedItems((current) => {
      const next = new Set(current);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      window.localStorage.setItem(`ecenovnik-list:${token}`, JSON.stringify([...next]));
      return next;
    });
  };

  const handleImagePreview = (barcode: string, name: string) => {
    setPreview({ name, barcode });
  };

  // Loading state
  if (loading && !list) {
    return <LoadingState />;
  }

  // Error state
  if (error && !list) {
    return <ErrorState error={error} onRetry={() => void load()} />;
  }

  // No list found
  if (!list) {
    return null;
  }

  return (
    <>
      <main className={styles.shell}>
        <ListHeader />
        <ListCard title={list.name} itemCount={list.items.length}>
          {list.items.length > 0 ? (
            <ul className={styles.items}>
              {list.items.map((item) => (
                <ListItem
                  key={item.productId}
                  productId={item.productId}
                  productName={item.productName}
                  barcode={item.primaryBarcode}
                  quantity={item.quantity}
                  checked={checkedItems.has(item.productId)}
                  onToggle={() => toggleItem(item.productId)}
                  onImagePreview={handleImagePreview}
                />
              ))}
            </ul>
          ) : (
            <EmptyState />
          )}
        </ListCard>
      </main>
      {preview && (
        <ImageModal
          productName={preview.name}
          barcode={preview.barcode}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}
