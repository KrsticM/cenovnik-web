import { Input } from "@/components/ui/input";
import { StateMessage } from "./StateMessage";
import { SecondaryLink } from "./StateActions";

export function NotFoundScreen() {
  return (
    <StateMessage
      illustration="not-found"
      eyebrow="Greška 404"
      title="Ova stranica ne postoji"
      description="Link je možda pogrešno upisan ili je zastareo. Potraži proizvod direktno:"
      actions={
        <>
          <form action="/proizvodi" method="get" role="search" className="relative flex w-full items-center">
            <span aria-hidden="true" className="pointer-events-none absolute left-5 block h-[15px] w-[15px] rounded-full border-2 border-ink-muted" />
            <Input
              type="search"
              name="q"
              aria-label="Pretraga proizvoda"
              placeholder="Pretraži proizvode..."
              enterKeyHint="search"
              className="h-[52px] rounded-[26px] border-line bg-white pl-12 pr-5 text-[15px] text-ink shadow-[0_2px_10px_rgba(26,26,26,0.05)] focus-visible:border-sage focus-visible:ring-[3px] focus-visible:ring-sage/20 focus-visible:ring-offset-0 md:text-[15px]"
            />
          </form>
          <span className="mt-2">
            <SecondaryLink href="/proizvodi">Nazad na proizvode</SecondaryLink>
          </span>
        </>
      }
    />
  );
}
