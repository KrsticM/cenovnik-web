import type { RefreshStatus } from "@/hooks/useSharedList";

export function LiveStatus({ status }: { status: RefreshStatus }) {
  if (status === "none") return null;
  const live = status === "live";

  return (
    <span className="flex items-center gap-2 whitespace-nowrap text-[13px] text-ink-muted">
      {live ? (
        <span aria-hidden="true" className="block h-2 w-2 animate-[livePulse_2.2s_ease-out_infinite] rounded-full bg-sage" />
      ) : (
        <span aria-hidden="true" className="block h-2 w-2 rounded-full border-[1.5px] border-ink-faint" />
      )}
      {live ? "Automatski se osvežava" : "Osvežavanje pauzirano"}
    </span>
  );
}
