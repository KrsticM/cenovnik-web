import { BrandMark } from "../BrandMark/BrandMark";
import { LiveIndicator } from "../LiveIndicator/LiveIndicator";
import styles from "./ListHeader.module.css";

export function ListHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <BrandMark size="sm" showImage />
        <span>eCenovnik</span>
      </div>
      <LiveIndicator />
    </header>
  );
}
