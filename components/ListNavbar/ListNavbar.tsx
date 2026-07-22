import Image from "next/image";
import styles from "./ListNavbar.module.css";

export function ListNavbar() {
  return (
    <header className={styles.bar}>
      <nav className={styles.nav}>
        <a href="/" className={styles.brand}>
          <Image
            src="/logo.png"
            alt="eCenovnik"
            width={48}
            height={48}
            className={styles.logo}
          />
          <span>eCenovnik</span>
        </a>
      </nav>
    </header>
  );
}
