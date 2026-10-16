import type { ReactNode } from "react";

interface SettingsRowProps {
  label?: string;
  description?: string;
  action: ReactNode;
}

// Text on the left, action on the right; on a phone the action wraps below.
export function SettingsRow({ label, description, action }: SettingsRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
      {label && <span className="text-[15px] font-medium">{label}</span>}
      {description && <p className="min-w-0 flex-[1_1_260px] text-sm leading-normal text-ink-muted text-pretty">{description}</p>}
      {action}
    </div>
  );
}
