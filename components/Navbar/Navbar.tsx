"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navItems } from "./navItems";
import { NavLink } from "./NavLink";
import { MobileNavMenu } from "./MobileNavMenu";

export function Navbar() {
  const { user, signOutUser } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3 no-underline">
          <Image
            src="/logo.png"
            alt="eCenovnik"
            width={48}
            height={48}
            className="rounded"
          />
          <span className="text-xl font-semibold text-primary">eCenovnik</span>
        </Link>

        {user && (
          <>
            <div className="hidden flex-1 items-center justify-center gap-2 sm:flex">
              {navItems.map(({ href, label, icon }) => (
                <NavLink
                  key={href}
                  href={href}
                  label={label}
                  icon={icon}
                  isActive={pathname === href}
                />
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button
                onClick={() => void signOutUser()}
                variant="outline"
                className="hidden sm:inline-flex"
              >
                Odjavi se
              </Button>

              <button
                className="inline-flex items-center justify-center rounded-lg p-2 text-primary transition-all duration-200 hover:bg-secondary sm:hidden"
                onMouseDown={() => setIsMenuOpen((v) => !v)}
                aria-label={isMenuOpen ? "Zatvori meni" : "Otvori meni"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </>
        )}
      </nav>

      {user && (
        <MobileNavMenu
          isOpen={isMenuOpen}
          navItems={navItems}
          onClose={() => setIsMenuOpen(false)}
          onSignOut={signOutUser}
        />
      )}
    </header>
  );
}
