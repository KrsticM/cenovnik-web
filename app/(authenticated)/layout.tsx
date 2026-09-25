"use client";

import { Navbar } from "@/components/Navbar/Navbar";
import { ShoppingListProvider } from "@/contexts/ShoppingListContext";
import styles from "./layout.module.css";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShoppingListProvider>
      <div className={styles.root}>
        <Navbar />
        {children}
      </div>
    </ShoppingListProvider>
  );
}
