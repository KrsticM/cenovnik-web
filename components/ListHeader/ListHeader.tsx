import { LiveIndicator } from "../LiveIndicator/LiveIndicator";
import styles from "./ListHeader.module.css";

export function ListHeader() {
  return (
    <header className={styles.header}>
      <LiveIndicator />
    </header>
  );
}
