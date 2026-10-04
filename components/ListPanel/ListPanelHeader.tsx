import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SheetClose, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { ShareIcon } from "./ShareListDialog";

interface ListPanelHeaderProps {
  listName: string;
  isPublic: boolean;
  onShare: () => void;
}

export function ListPanelHeader({ listName, isPublic, onShare }: ListPanelHeaderProps) {
  return (
    <div className="border-b border-line px-5 pb-4 pt-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <SheetTitle className="text-xl font-semibold tracking-[-0.02em] text-ink">Tvoja lista</SheetTitle>
          <SheetDescription className="sr-only">Proizvodi na tvojoj listi za kupovinu</SheetDescription>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="list">{listName}</Badge>
            {isPublic && (
              <Badge variant="public">
                <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full bg-sage" />
                Javna
              </Badge>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="pill"
            size="icon-lg"
            onClick={onShare}
            aria-label="Podeli listu"
            className="shrink-0 text-sage-dark [&_svg]:size-[18px]"
          >
            <ShareIcon size={18} />
          </Button>
          <SheetClose asChild>
            <Button
              variant="pill"
              size="icon-lg"
              aria-label="Zatvori"
              className="shrink-0 text-base font-normal text-ink-muted hover:text-sage-dark"
            >
              ×
            </Button>
          </SheetClose>
        </div>
      </div>
    </div>
  );
}
