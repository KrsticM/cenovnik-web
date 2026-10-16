import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface StoreLimitNoticeProps {
  text: string;
  showUpsell: boolean;
}

export function StoreLimitNotice({ text, showUpsell }: StoreLimitNoticeProps) {
  return (
    <Alert
      role="status"
      variant="note-compact"
      className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2.5"
    >
      <span className="min-w-0 flex-[1_1_240px]">{text}</span>
      {showUpsell && (
        <Button asChild variant="rust" size="pill-sm" className="px-4">
          <Link href="/premium">Premium članstvo</Link>
        </Button>
      )}
    </Alert>
  );
}
