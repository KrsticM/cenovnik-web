import { useId, type ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

interface SettingsSectionProps {
  title: string;
  first?: boolean;
  children: ReactNode;
}

export function SettingsSection({ title, first = false, children }: SettingsSectionProps) {
  const headingId = useId();
  return (
    <>
      {!first && <Separator className="bg-line-warm" />}
      <section aria-labelledby={headingId} className="flex flex-col gap-3.5 py-6">
        <h3 id={headingId} className="text-sm font-semibold text-ink-muted">
          {title}
        </h3>
        {children}
      </section>
    </>
  );
}
