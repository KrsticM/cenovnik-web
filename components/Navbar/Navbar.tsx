"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BrandLogo } from "./BrandLogo";
import { ListBadge } from "./ListBadge";
import { AccountMenu } from "./AccountMenu";
import { ListPanel } from "@/components/ListPanel/ListPanel";

export function Navbar() {
  const { user } = useAuth();
  const [listPanelOpen, setListPanelOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <BrandLogo />

          {user && (
            <div className="flex shrink-0 items-center gap-3">
              <ListBadge onClick={() => setListPanelOpen(true)} />
              <AccountMenu />
            </div>
          )}
        </nav>
      </header>

      {user && (
        <ListPanel open={listPanelOpen} onOpenChange={setListPanelOpen} />
      )}
    </>
  );
}
