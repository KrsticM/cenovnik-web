import Image from "next/image";
import styles from "./AuthShell.module.css";

interface AuthShellProps {
  children: React.ReactNode;
  showBranding?: boolean;
}

export function AuthShell({ children, showBranding = false }: AuthShellProps) {
  if (showBranding) {
    return (
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.brandingColumn}>
            <div className={styles.brandingContent}>
              <Image
                src="/icon.png"
                alt="eCenovnik"
                width={128}
                height={128}
                className={styles.icon}
              />
              <Image
                src="/ecenovnik-wordmark.png"
                alt="eCenovnik"
                width={230}
                height={48}
                className={styles.wordmark}
              />
              <p className={styles.slogan}>Tvoj vodič za pametnu kupovinu.</p>
            </div>
          </div>
          <div className={styles.formColumn}>
            {children}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {children}
      </div>
    </main>
  );
}
