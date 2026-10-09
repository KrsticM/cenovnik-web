import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="pill"
      aria-label="Nazad"
      onClick={onClick}
      className="-ml-1.5 -mt-1.5 h-11 w-11 rounded-full p-0 focus-visible:ring-offset-[3px] [&_svg]:size-5"
    >
      <ChevronLeft strokeWidth={1.8} />
    </Button>
  );
}
