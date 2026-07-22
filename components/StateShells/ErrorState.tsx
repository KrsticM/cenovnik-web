import styles from "./StateShells.module.css";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <main className={styles.shell}>
      <div>
        <p className={styles.eyebrow}>eCenovnik</p>
        <h1>Lista nije dostupna</h1>
        <p>{error}</p>
        <button className={styles.retryButton} onClick={onRetry}>
          Pokušaj ponovo
        </button>
      </div>
    </main>
  );
}
