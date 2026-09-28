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
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-line bg-white/95 backdrop-blur-md">
        <nav className="mx-auto flex h-[68px] w-full max-w-[1360px] items-center justify-between gap-5 px-4 sm:px-5 lg:px-8 2xl:max-w-[1720px] 2xl:px-12">
          <BrandLogo />

          {user && (
            <div className="flex shrink-0 items-center gap-2.5">
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
