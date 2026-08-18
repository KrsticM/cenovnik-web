"use client";

import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./ListNavbar.module.css";

export function ListNavbar() {
  const { user, signOutUser } = useAuth();

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
        {user && (
          <button
            onClick={() => void signOutUser()}
            className={styles.signOutButton}
          >
            Odjavi se
          </button>
        )}
      </nav>
    </header>
  );
}
