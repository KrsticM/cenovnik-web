"use client";

import styles from "./PlaceholderPage.module.css";

interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  action,
}: PlaceholderPageProps) {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Eyebrow label */}
          <p className={styles.eyebrow}>{eyebrow}</p>

          {/* Large heading */}
          <h1 className={styles.title}>{title}</h1>

          {/* Description */}
          <p className={styles.description}>{description}</p>

          {/* Optional action button or content */}
          {action && <div className={styles.actionContainer}>{action}</div>}
        </div>
      </div>
    </main>
  );
}
