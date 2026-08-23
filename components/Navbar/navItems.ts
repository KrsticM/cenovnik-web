import { LucideIcon } from "lucide-react";
import { Store, ShoppingCart, Settings } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/proizvodi", label: "Proizvodi", icon: Store },
  { href: "/lista", label: "Lista", icon: ShoppingCart },
  { href: "/podesavanja", label: "Podešavanja", icon: Settings },
];
