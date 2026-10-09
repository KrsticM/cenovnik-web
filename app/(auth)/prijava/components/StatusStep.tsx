import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";

interface StatusStepProps {
  icon: ReactNode;
  title: string;
  text: string;
  status: string;
}

export function StatusStep({ icon, title, text, status }: StatusStepProps) {
  return (
    <div className="flex flex-col items-center py-3 text-center animate-[fadeUp_200ms_ease_both]">
      {icon}
      <h1 className="mt-[22px] text-[26px] font-semibold leading-[1.2] tracking-[-0.025em] text-ink">{title}</h1>
      <p className="mt-2.5 text-base leading-normal text-ink-muted text-pretty">{text}</p>
      <div role="status" className="mt-6 flex items-center gap-2 text-sm text-ink-muted">
        <Spinner size={14} />
        {status}
      </div>
    </div>
  );
}
