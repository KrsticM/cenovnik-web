import { Checkbox } from "../Checkbox/Checkbox";
import { ProductImage } from "../ProductImage/ProductImage";
import { Badge } from "../ui/badge";
import styles from "./ListItem.module.css";

interface ListItemProps {
  productId: string;
  productName: string;
  barcode?: string;
  quantity: number;
  checked: boolean;
  onToggle: () => void;
  onImagePreview: (barcode: string, name: string) => void;
}

export function ListItem({
  productId,
  productName,
  barcode,
  quantity,
  checked,
  onToggle,
  onImagePreview,
}: ListItemProps) {
  return (
    <li className={`${styles.item} ${checked ? styles.checked : ""}`}>
      <Checkbox
        checked={checked}
        onChange={onToggle}
        ariaLabel={
          checked ? `Vrati ${productName} na listu` : `Označi ${productName} kao kupljeno`
        }
      />

      {barcode && (
        <ProductImage barcode={barcode} productName={productName} onPreview={onImagePreview} />
      )}

      <div className={styles.info}>
        <p className={styles.name}>{productName}</p>
        {barcode && <p className={styles.barcode}>Barkod {barcode}</p>}
      </div>

      <Badge variant="secondary" aria-label={`Količina ${quantity}`} className={styles.quantity}>
        × {quantity}
      </Badge>
    </li>
  );
}
