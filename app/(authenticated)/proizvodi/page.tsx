"use client";

import { useAuth } from "@/contexts/AuthContext";
import styles from "./page.module.css";

export default function ProizvodiPage() {
  const { user, signOutUser } = useAuth();

  return (
    <main className={styles.shell}>
      <div className={styles.container}>
        <p className={styles.greeting}>
          Dobrodošli{user?.email ? `, ${user.email}` : ""}!
        </p>
        <p className={styles.note}>Ovde će uskoro biti pretraga proizvoda.</p>
        <button onClick={signOutUser} className={styles.button}>
          Odjavi se
        </button>
      </div>
    </main>
  );
}
