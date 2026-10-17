"use client";

import { useMyMarketsDialog } from "@/components/MyMarketsDialog/MyMarketsDialogProvider";
import { useSettingsDialog } from "@/components/SettingsDialog/SettingsDialogProvider";
import { useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function AccountMenu() {
  const { user, signOutUser } = useAuth();
  const { open: openMyMarkets } = useMyMarketsDialog();
  const { open: openSettings } = useSettingsDialog();
  // The menu item is gone by the time a dialog closes, so focus goes back to the account button.
  const triggerRef = useRef<HTMLButtonElement>(null);

  if (!user?.email) return null;

  // Extract initials from email
  const initials = user.email
    .split("@")[0]
    .split(".")
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOutUser();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        ref={triggerRef}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full",
          "bg-cream text-sage-dark font-semibold text-sm",
          "border border-line transition-colors hover:border-sage"
        )}
        aria-label="Nalog i podešavanja"
      >
        {initials}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="z-50 w-[220px] rounded-[14px] border-line p-2 shadow-[0_14px_40px_rgba(26,26,26,0.14)]">
        {/* User info header */}
        <div className="border-b border-line-soft px-3 pb-3 pt-2.5">
          <div className="text-sm font-semibold text-foreground truncate">
            {user.user_metadata?.name || "Korisnik"}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {user.email}
          </div>
        </div>

        {/* Menu items */}
        <DropdownMenuItem onSelect={() => openSettings(triggerRef.current)}>Podešavanja</DropdownMenuItem>

        <DropdownMenuItem onSelect={() => openMyMarkets(triggerRef.current)}>Moji marketi</DropdownMenuItem>

        <DropdownMenuItem onSelect={handleSignOut} className="text-ink-muted hover:text-rust focus:text-rust">
          Odjavi se
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
