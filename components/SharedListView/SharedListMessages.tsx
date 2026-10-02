import { SUPPORT_EMAIL } from "@/lib/support";
import { InlineLink } from "../StatePage/InlineLink";
import { StateMessage } from "../StatePage/StateMessage";
import { PrimaryAction, PrimaryLink, SecondaryLink } from "../StatePage/StateActions";

// Same screen for a deleted list and disabled sharing, so the link never reveals which.
export function SharedListNotFound() {
  return (
    <StateMessage
      illustration="link-inactive"
      title="Ovaj link više nije aktivan"
      description="Lista je možda obrisana ili više nije podeljena. Zamoli osobu koja ti je poslala listu da je ponovo podeli."
      actions={<PrimaryLink href="/">Otvori eCenovnik</PrimaryLink>}
    />
  );
}

// Nothing could be shown (server or network). Retrying shows the skeleton again.
export function SharedListError({ onRetry }: { onRetry: () => void }) {
  return (
    <StateMessage
      role="alert"
      illustration="unavailable"
      title="Lista trenutno nije dostupna"
      description="Nismo uspeli da je učitamo. Lista je sačuvana i nije izgubljena, pokušaj ponovo za koji trenutak."
      actions={
        <>
          <PrimaryAction onClick={onRetry}>Pokušaj ponovo</PrimaryAction>
          <SecondaryLink href="/">Početna stranica</SecondaryLink>
        </>
      }
      footnote={
        <>
          Ako se ponavlja, piši nam na{" "}
          <InlineLink href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</InlineLink>
        </>
      }
    />
  );
}
