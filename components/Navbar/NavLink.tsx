import Link from "next/link";

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  isActive: boolean;
  onClick?: () => void;
  isMobileMenuItem?: boolean;
}

export function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
  isMobileMenuItem = false,
}: NavLinkProps) {
  const baseClasses =
    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 no-underline";
  const mobileClasses = isMobileMenuItem ? "w-full px-4 py-3" : "";
  const activeClasses = isActive
    ? "bg-secondary text-primary"
    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground";

  return (
    <Link
      href={href}
      className={`${baseClasses} ${mobileClasses} active:scale-98 ${activeClasses}`}
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
}
