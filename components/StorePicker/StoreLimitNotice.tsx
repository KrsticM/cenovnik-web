import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface StoreLimitNoticeProps {
  text: string;
  // Only when the user can act on it: the way to Premium (where it is explained).
  onUpgrade?: (trigger: HTMLElement) => void;
}

export function StoreLimitNotice({ text, onUpgrade }: StoreLimitNoticeProps) {
  return (
    <Alert
      role="status"
      variant="note-compact"
      className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2.5"
    >
      <span className="min-w-0 flex-[1_1_240px]">{text}</span>
      {onUpgrade && (
        <Button type="button" variant="rust" size="pill-sm" aria-haspopup="dialog" onClick={(event) => onUpgrade(event.currentTarget)} className="h-11 px-[18px]">
          Premium članstvo
        </Button>
      )}
    </Alert>
  );
}
