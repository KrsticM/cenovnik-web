"use client";

import { Navbar } from "@/components/Navbar/Navbar";
import styles from "./layout.module.css";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.root}>
      <Navbar />
      {children}
    </div>
  );
}
