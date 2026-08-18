import styles from "./PlaceholderCard.module.css";

interface PlaceholderCardProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function PlaceholderCard({
  eyebrow,
  title,
  description,
  action,
}: PlaceholderCardProps) {
  return (
    <main className={styles.shell}>
      <div className={styles.container}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        {action && <div className={styles.actionContainer}>{action}</div>}
      </div>
    </main>
  );
}
