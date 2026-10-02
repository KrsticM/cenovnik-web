import type { ComponentProps, ReactNode } from "react";
import { StateIllustration } from "@/components/ui/state-illustration";
import { SectionLabel } from "@/components/ui/section-label";

interface StateMessageProps {
  illustration: ComponentProps<typeof StateIllustration>["variant"];
  // Small label above the title, e.g. "Greška 404".
  eyebrow?: string;
  title: string;
  description: ReactNode;
  // Primary action first, secondary link after it.
  actions?: ReactNode;
  footnote?: ReactNode;
  // role="alert" for errors so screen readers announce them.
  role?: "alert";
}

// Centered system message (not found, errors) on the paper background, max 480 px wide.
export function StateMessage({ illustration, eyebrow, title, description, actions, footnote, role }: StateMessageProps) {
  return (
    <div
      role={role}
      className="mx-auto max-w-[480px] animate-[fadeIn_200ms_ease_both] px-5 pb-12 pt-14 text-center sm:px-6 sm:pb-16 sm:pt-24"
    >
      <StateIllustration variant={illustration} />
      {eyebrow && <SectionLabel className="mt-6 tracking-[0.1em] text-rust">{eyebrow}</SectionLabel>}
      <h1
        className={`${eyebrow ? "mt-2" : "mt-7"} text-balance text-2xl font-semibold leading-[1.2] tracking-[-0.02em] text-ink sm:text-[30px]`}
      >
        {title}
      </h1>
      <p className="mt-3 text-pretty text-base leading-[1.55] text-ink-muted">{description}</p>
      {actions && <div className="mt-7 flex flex-col items-center gap-2">{actions}</div>}
      {footnote && <p className="mt-5 text-pretty text-[13px] leading-[1.55] text-ink-muted">{footnote}</p>}
    </div>
  );
}
