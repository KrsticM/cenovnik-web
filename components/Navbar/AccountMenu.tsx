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
import { useLandBounce } from "@/hooks/useLandBounce";
import { cn } from "@/lib/utils";

export function AccountMenu() {
  const { user, signOutUser } = useAuth();
  const { open: openMyMarkets } = useMyMarketsDialog();
  const { open: openSettings } = useSettingsDialog();
  // The menu item is gone by the time a dialog closes, so focus goes back to the account button.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { landing, bounce } = useLandBounce();
  // Picking an item goes straight to the next screen, so only a dismissal bounces.
  const pickedRef = useRef(false);

  if (!user?.email) return null;

  // Extract initials from email
  const initials = user.email
    .split("@")[0]
    .split(".")
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  const handleSignOut = async () => {
    pickedRef.current = true;
    await signOutUser();
  };


  const changeOpen = (open: boolean) => {
    if (!open && !pickedRef.current) bounce();
    pickedRef.current = false;
  };

  return (
    <DropdownMenu onOpenChange={changeOpen}>
      <DropdownMenuTrigger
        ref={triggerRef}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full",
          "bg-cream text-sage-dark font-semibold text-sm",
          "border border-line [transition:border-color_180ms_ease,scale_480ms_cubic-bezier(0.34,1.56,0.64,1)] hover:border-sage",
          landing && "scale-[1.12]"
        )}
        aria-label="Nalog i podešavanja"
      >
        {initials}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="z-50 w-[220px] rounded-[14px] border-line p-2 shadow-[0_14px_40px_rgba(26,26,26,0.14)] data-[state=open]:animate-[menuIn_280ms_cubic-bezier(0,0,0.2,1)_both] data-[state=closed]:animate-[menuOut_280ms_cubic-bezier(0.4,0,1,1)_both]">
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
        <DropdownMenuItem onSelect={() => {
            pickedRef.current = true;
            openSettings(triggerRef.current);
          }}>Podešavanja</DropdownMenuItem>

        <DropdownMenuItem onSelect={() => {
            pickedRef.current = true;
            openMyMarkets(triggerRef.current);
          }}>Moji marketi</DropdownMenuItem>

        <DropdownMenuItem onSelect={handleSignOut} className="text-ink-muted hover:text-rust focus:text-rust">
          Odjavi se
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
