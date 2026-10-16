import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Heading, Text } from "@/components/ui/typography";

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
      <Heading size="status" className="mt-[22px]">{title}</Heading>
      <Text className="mt-2.5">{text}</Text>
      <div role="status" className="mt-6 flex items-center gap-2 text-sm text-ink-muted">
        <Spinner size={14} />
        {status}
      </div>
    </div>
  );
}
