import styles from "./LiveIndicator.module.css";

export function LiveIndicator() {
  return (
    <div className={styles.indicator}>
      <span className={styles.dot} />
      <span className={styles.text}>Automatski se osvežava</span>
    </div>
  );
}
