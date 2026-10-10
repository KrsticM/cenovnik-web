"use client";

import type { ReactNode } from "react";
import { MyMarketsDialogProvider } from "@/components/MyMarketsDialog/MyMarketsDialogProvider";
import { Navbar } from "@/components/Navbar/Navbar";
import { RemovalToast } from "@/components/RemovalToast/RemovalToast";
import { ShoppingListProvider } from "@/contexts/ShoppingListContext";

export function AppShell({ requireMyMarkets = false, children }: { requireMyMarkets?: boolean; children: ReactNode }) {
  return (
    <MyMarketsDialogProvider required={requireMyMarkets}>
      <ShoppingListProvider>
        <div className="flex min-h-screen w-full flex-col pt-[68px]">
          <Navbar />
          {children}
          <RemovalToast />
        </div>
      </ShoppingListProvider>
    </MyMarketsDialogProvider>
  );
}
