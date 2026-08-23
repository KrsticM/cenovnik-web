"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NavItem } from "./navItems";
import { NavLink } from "./NavLink";

interface MobileNavMenuProps {
  isOpen: boolean;
  navItems: NavItem[];
  onClose: () => void;
  onSignOut: () => Promise<void>;
}

export function MobileNavMenu({
  isOpen,
  navItems,
  onClose,
  onSignOut,
}: MobileNavMenuProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  const handleSignOut = async () => {
    onClose();
    await onSignOut();
  };

  return (
    <div
      id="mobile-menu"
      className="absolute top-full left-0 right-0 border-b border-border bg-background shadow-lg"
    >
      <div className="flex flex-col gap-1 px-4 py-3">
        {navItems.map(({ href, label, icon: Icon }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={Icon}
            isActive={pathname === href}
            onClick={onClose}
            isMobileMenuItem
          />
        ))}

        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full justify-start"
        >
          Odjavi se
        </Button>
      </div>
    </div>
  );
}
