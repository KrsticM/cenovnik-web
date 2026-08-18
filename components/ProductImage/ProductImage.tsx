import { getProductImageUrl } from "@/lib/productImageUrl";
import styles from "./ProductImage.module.css";

interface ProductImageProps {
  barcode: string;
  productName: string;
  onPreview: (barcode: string, name: string) => void;
}

export function ProductImage({ barcode, productName, onPreview }: ProductImageProps) {
  return (
    <button
      type="button"
      aria-label={`Prikaži veću sliku za ${productName}`}
      onClick={() => onPreview(barcode, productName)}
      className={styles.button}
    >
      <img
        className={styles.image}
        src={getProductImageUrl(barcode, "thumb")}
        alt=""
        onError={(e) => {
          if (e.currentTarget.parentElement) {
            e.currentTarget.parentElement.style.display = "none";
          }
        }}
      />
    </button>
  );
}
