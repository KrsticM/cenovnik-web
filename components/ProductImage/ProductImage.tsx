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
        src={`https://img.cenovnik.krsticm.dev/images/products/${encodeURIComponent(barcode)}/thumb.jpg`}
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
