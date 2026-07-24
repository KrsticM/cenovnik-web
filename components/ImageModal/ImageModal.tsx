"use client";

import { useEffect } from "react";
import styles from "./ImageModal.module.css";

interface ImageModalProps {
  productName: string;
  barcode: string;
  onClose: () => void;
}

export function ImageModal({ productName, barcode, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <section
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-dialog-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="image-dialog-title" className={styles.title}>
            {productName}
          </h2>
          <button
            className={styles.closeButton}
            type="button"
            aria-label="Zatvori sliku"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className={styles.content}>
          <img
            className={styles.fullImage}
            src={`https://img.cenovnik.krsticm.dev/images/products/${encodeURIComponent(barcode)}/full.jpg`}
            alt={productName}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://img.cenovnik.krsticm.dev/images/products/${encodeURIComponent(barcode)}/thumb.jpg`;
            }}
          />
        </div>
      </section>
    </div>
  );
}
