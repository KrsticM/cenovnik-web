"use client";

import { useState } from "react";
import { useShoppingListData, useCheckedItems } from "@/hooks";
import { getProductImageUrl } from "@/lib/productImageUrl";
import { Container } from "../Container/Container";
import { Navbar } from "../Navbar/Navbar";
import { ListHeader } from "../ListHeader/ListHeader";
import { ListCard } from "../ListCard/ListCard";
import { ListItem } from "../ListItem/ListItem";
import { ImageModal } from "../ImageModal/ImageModal";
import { LoadingState } from "../StateShells/LoadingState";
import { ErrorState } from "../StateShells/ErrorState";
import { EmptyState } from "../StateShells/EmptyState";
import styles from "./SharedListView.module.css";

interface SharedListViewProps {
  token: string;
}

export function SharedListView({ token }: SharedListViewProps) {
  const { list, loading, error, refresh } = useShoppingListData(token);
  const { checkedItems, toggleItem } = useCheckedItems(token);
  const [preview, setPreview] = useState<{ title: string; imageUrl: string; fallbackUrl: string } | null>(null);

  const handleImagePreview = (barcode: string, name: string) => {
    setPreview({
      title: name,
      imageUrl: getProductImageUrl(barcode, "full"),
      fallbackUrl: getProductImageUrl(barcode, "thumb"),
    });
  };

  // Loading state
  if (loading && !list) {
    return <LoadingState />;
  }

  // Error state
  if (error && !list) {
    return <ErrorState error={error} onRetry={() => void refresh()} />;
  }

  // No list found
  if (!list) {
    return null;
  }

  return (
    <>
      <Navbar />
      <Container as="main" size="sm" className={styles.shell}>
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
      </Container>
      {preview && (
        <ImageModal
          open={preview !== null}
          title={preview.title}
          imageUrl={preview.imageUrl}
          fallbackUrl={preview.fallbackUrl}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}
