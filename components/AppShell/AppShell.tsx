"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar/Navbar";
import { RemovalToast } from "@/components/RemovalToast/RemovalToast";
import { ShoppingListProvider } from "@/contexts/ShoppingListContext";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ShoppingListProvider>
      <div className="flex min-h-screen w-full flex-col pt-[68px]">
        <Navbar />
        {children}
        <RemovalToast />
      </div>
    </ShoppingListProvider>
  );
}
