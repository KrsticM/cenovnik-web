"use client";

import { ListNavbar } from "@/components/ListNavbar/ListNavbar";
import styles from "./layout.module.css";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.root}>
      <ListNavbar />
      {children}
    </div>
  );
}
