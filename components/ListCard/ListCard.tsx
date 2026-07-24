import { ReactNode } from "react";
import styles from "./ListCard.module.css";

interface ListCardProps {
  title: string;
  itemCount: number;
  children: ReactNode;
}

export function ListCard({ title, itemCount, children }: ListCardProps) {
  return (
    <section className={styles.card} aria-labelledby="list-title">
      <div className={styles.titleSection}>
        <p className={styles.eyebrow}>Podeljena lista</p>
        <h1 id="list-title" className={styles.title}>
          {title}
        </h1>
        <p className={styles.meta}>
          {itemCount === 1 ? "1 proizvod" : `${itemCount} proizvoda`}
        </p>
      </div>
      {children}
    </section>
  );
}
