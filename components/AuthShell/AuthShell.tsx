import Link from "next/link";
import { BrandMark } from "../BrandMark/BrandMark";
import styles from "./AuthShell.module.css";

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.container}>
        <Link href="/" className={styles.logoLink}>
          <BrandMark size="md" showImage />
          <span className={styles.wordmark}>eCenovnik</span>
        </Link>
        <p className={styles.slogan}>Tvoj vodič za pametnu kupovinu.</p>
        {children}
      </div>
    </div>
  );
}
