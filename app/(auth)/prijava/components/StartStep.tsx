import { Alert } from "@/components/ui/alert";
import { BrandBars } from "@/components/ui/brand-bars";
import { Button } from "@/components/ui/button";
import { Heading, Strong, Text } from "@/components/ui/typography";
import { PRIVACY_URL, TERMS_URL } from "@/lib/support";
import type { OAuthError, OAuthProvider } from "../hooks/useSigninFlow";
import { AppleIcon, EmailIcon, GoogleIcon } from "@/components/ui/provider-icon";
import { OAuthButton } from "./OAuthButton";

const ERRORS: Record<OAuthError, string> = {
  apple: "Prijava preko Apple naloga nije uspela. Pokušaj ponovo ili izaberi drugi način.",
  google: "Prijava preko Google naloga nije uspela. Pokušaj ponovo ili izaberi drugi način.",
  unknown: "Prijava nije uspela. Pokušaj ponovo ili izaberi drugi način.",
};

interface StartStepProps {
  returnTo: string | null;
  oauth: OAuthProvider | null;
  oauthError: OAuthError | null;
  onOAuth: (provider: OAuthProvider) => void;
  onEmail: () => void;
}

export function StartStep({ returnTo, oauth, oauthError, onOAuth, onEmail }: StartStepProps) {
  const busy = oauth !== null;
  return (
    <>
      <div className="flex flex-col items-center text-center animate-[fadeUp_200ms_ease_both]">
        <BrandBars />
        <Heading size="brand" className="mt-[22px]">
          <span className="text-terracotta">e</span>Cenovnik
        </Heading>
        <Text size="plain" className="mt-2.5">Tvoj vodič za pametnu kupovinu.</Text>
      </div>

      {returnTo && (
        <Alert role="note" variant="note" className="mt-7 text-center">
          Posle prijave vraćamo te na: <Strong>{returnTo}</Strong>
        </Alert>
      )}

      {oauthError && (
        <Alert variant="error" className="mt-6 animate-[fadeUp_200ms_ease_both]">
          {ERRORS[oauthError]}
        </Alert>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <OAuthButton
          icon={<AppleIcon />}
          label={oauth === "apple" ? "Povezivanje sa Apple…" : "Nastavi sa Apple nalogom"}
          loading={oauth === "apple"}
          disabled={busy}
          dimmed={busy && oauth !== "apple"}
          onClick={() => onOAuth("apple")}
        />
        <OAuthButton
          icon={<GoogleIcon />}
          label={oauth === "google" ? "Povezivanje sa Google…" : "Nastavi sa Google nalogom"}
          loading={oauth === "google"}
          disabled={busy}
          dimmed={busy && oauth !== "google"}
          onClick={() => onOAuth("google")}
        />
        <OAuthButton icon={<EmailIcon />} label="Nastavi sa e-mailom" disabled={busy} dimmed={busy} onClick={onEmail} />
      </div>

      <Text size="caption" className="mt-7 text-center">
        Prijavom prihvataš{" "}
        <Button asChild variant="underline" size="text" className="inline text-[13px] font-normal">
          <a href={TERMS_URL}>uslove korišćenja</a>
        </Button>{" "}
        i{" "}
        <Button asChild variant="underline" size="text" className="inline text-[13px] font-normal">
          <a href={PRIVACY_URL}>politiku privatnosti</a>
        </Button>
        .
      </Text>
    </>
  );
}
