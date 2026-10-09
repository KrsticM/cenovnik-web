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
      className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2.5 rounded-[12px] border-0 bg-cream px-3.5 py-3 text-[13px] leading-[1.45] text-sage-dark text-pretty"
    >
      <span className="min-w-0 flex-[1_1_240px]">{text}</span>
      {showUpsell && (
        <Button asChild size="pill-sm" className="bg-rust px-4 font-semibold text-white hover:bg-rust-dark">
          <Link href="/premium">Premium članstvo</Link>
        </Button>
      )}
    </Alert>
  );
}
