import { useEffect, useId, useRef, type ReactNode } from "react";
import { Separator } from "@/components/ui/separator";

interface SettingsSectionProps {
  title: string;
  first?: boolean;
  // Moves focus to the title when the dialog opens straight onto this section.
  focusTitle?: boolean;
  children: ReactNode;
}

export function SettingsSection({ title, first = false, focusTitle = false, children }: SettingsSectionProps) {
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // After the dialog has placed its own initial focus.
  useEffect(() => {
    if (!focusTitle) return;
    const frame = requestAnimationFrame(() => headingRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [focusTitle]);

  return (
    <>
      {!first && <Separator className="bg-line-warm" />}
      <section aria-labelledby={headingId} className="flex flex-col gap-3.5 py-6">
        <h3 id={headingId} ref={headingRef} tabIndex={focusTitle ? -1 : undefined} className="text-sm font-semibold text-ink-muted outline-none">
          {title}
        </h3>
        {children}
      </section>
    </>
  );
}
