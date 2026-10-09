import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface OAuthButtonProps {
  icon: ReactNode;
  label: string;
  loading?: boolean;
  dimmed?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function OAuthButton({ icon, label, loading, dimmed, disabled, onClick }: OAuthButtonProps) {
  return (
    <Button
      variant="pill"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative h-[52px] w-full rounded-full px-[52px] text-[15px] font-medium transition-[border-color,opacity] duration-150 focus-visible:ring-offset-[3px] disabled:opacity-100",
        dimmed && "disabled:opacity-50"
      )}
    >
      <span aria-hidden="true" className="absolute left-5 flex h-5 w-5 items-center justify-center">
        {loading ? <Spinner tone="dark" /> : icon}
      </span>
      {label}
    </Button>
  );
}
