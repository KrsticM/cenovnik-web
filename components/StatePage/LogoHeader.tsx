import { BrandLogo } from "../Navbar/BrandLogo";

// Minimal header for pages outside the app shell (root error page).
export function LogoHeader() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center px-4 sm:px-8">
        <BrandLogo size="sm" />
      </div>
    </header>
  );
}
