import styles from "./StateShells.module.css";

export function LoadingState() {
  return (
    <main className={styles.shell}>
      <div>
        <div className={styles.loader} />
        <h1>Otvaramo listu…</h1>
        <p>Učitavamo proizvode i količine.</p>
      </div>
    </main>
  );
}
