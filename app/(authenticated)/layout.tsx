"use client";

import { Navbar } from "@/components/Navbar/Navbar";
import { ShoppingListProvider } from "@/contexts/ShoppingListContext";
import { RemovalToast } from "@/components/RemovalToast/RemovalToast";
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
        <RemovalToast />
      </div>
    </ShoppingListProvider>
  );
}
