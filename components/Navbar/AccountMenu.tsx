"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AccountMenu() {
  const { user, signOutUser } = useAuth();

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
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full",
          "bg-[#FFEDD0] text-[#4f5c42] font-semibold text-sm",
          "hover:bg-[#f0e0c0] transition-colors",
          "border border-transparent"
        )}
        aria-label="Nalog i podešavanja"
      >
        {initials}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* User info header */}
        <div className="px-2 py-3 border-b border-border">
          <div className="text-sm font-semibold text-foreground truncate">
            {user.user_metadata?.name || "Korisnik"}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {user.email}
          </div>
        </div>

        {/* Menu items */}
        <Link href="/podesavanja">
          <DropdownMenuItem>Podešavanja</DropdownMenuItem>
        </Link>

        <Link href="/prodavnice">
          <DropdownMenuItem>Moje prodavnice</DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={handleSignOut}
          className="text-[#A85B2A] hover:bg-red-50 hover:text-red-600"
        >
          Odjava
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
