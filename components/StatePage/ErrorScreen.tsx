"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CONTACT_URL, SUPPORT_EMAIL } from "@/lib/support";
import { Badge } from "@/components/ui/badge";
import { InlineLink } from "./InlineLink";
import { StateMessage } from "./StateMessage";
import { PrimaryAction, SecondaryLink } from "./StateActions";

interface ErrorScreenProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorScreen({ error, reset }: ErrorScreenProps) {
  const router = useRouter();
  const [retrying, startRetry] = useTransition();
  const code = error.digest;

  useEffect(() => {
    console.error(error);
  }, [error]);

  const retry = () =>
    startRetry(() => {
      router.refresh();
      reset();
    });

  const mailto = `mailto:${SUPPORT_EMAIL}${code ? `?subject=${encodeURIComponent(`Greška ${code}`)}` : ""}`;

  return (
    <>
    <title>Greška | eCenovnik</title>
    <StateMessage
      role="alert"
      illustration="error"
      title="Nešto nije u redu"
      description="Problem je kod nas, ne kod tebe. Već radimo na tome, a tvoja lista i podešavanja su sačuvani."
      actions={
        <>
          <PrimaryAction onClick={retry} disabled={retrying}>
            {retrying ? "Pokušavam…" : "Pokušaj ponovo"}
          </PrimaryAction>
          <SecondaryLink href="/proizvodi">Nazad na proizvode</SecondaryLink>
        </>
      }
      footnote={
        <>
          Ako se ponavlja, javi nam preko <InlineLink href={CONTACT_URL}>stranice za kontakt</InlineLink> ili na{" "}
          <InlineLink href={mailto}>{SUPPORT_EMAIL}</InlineLink>
          {code && (
            <>
              {" "}i navedi kod: <Badge variant="code">{code}</Badge>
            </>
          )}
        </>
      }
    />
    </>
  );
}
