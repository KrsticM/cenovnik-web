import { BrandLogo } from "../Navbar/BrandLogo";

// Header of the public shared list. "paused" = offline (the pulse stops and says so);
// "none" = nothing to refresh (dead link, list failed to load).
export function SharedHeader({ status = "live" }: { status?: "live" | "paused" | "none" }) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-[760px] items-center justify-between gap-4 px-[clamp(16px,4vw,24px)]">
        <BrandLogo size="sm" />
        {status !== "none" && (
          <span className="flex items-center gap-2 whitespace-nowrap text-[13px] text-ink-muted">
            {status === "live" ? (
              <span aria-hidden="true" className="block h-2 w-2 animate-[livePulse_2.2s_ease-out_infinite] rounded-full bg-sage" />
            ) : (
              <span aria-hidden="true" className="block h-2 w-2 rounded-full border-[1.5px] border-ink-faint" />
            )}
            {status === "live" ? "Automatski se osvežava" : "Osvežavanje pauzirano"}
          </span>
        )}
      </div>
    </header>
  );
}
