import { Alert } from "@/components/ui/alert";
import { BrandBars } from "@/components/ui/brand-bars";
import { Button } from "@/components/ui/button";
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
        <h1 className="mt-[22px] text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-ink">
          <span className="text-terracotta">e</span>Cenovnik
        </h1>
        <p className="mt-2.5 text-base text-ink-muted">Tvoj vodič za pametnu kupovinu.</p>
      </div>

      {returnTo && (
        <Alert role="note" className="mt-7 rounded-[14px] border-0 bg-cream px-4 py-3 text-center text-sm leading-[1.45] text-sage-dark text-pretty">
          Posle prijave vraćamo te na: <strong className="font-semibold">{returnTo}</strong>
        </Alert>
      )}

      {oauthError && (
        <Alert className="mt-6 rounded-[14px] border-rust-border bg-rust-tint px-4 py-3 text-sm leading-[1.45] text-rust text-pretty animate-[fadeUp_200ms_ease_both]">
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

      <p className="mt-7 text-center text-[13px] leading-normal text-ink-muted text-pretty">
        Prijavom prihvataš{" "}
        <Button asChild variant="underline" size="text" className="inline text-[13px] font-normal">
          <a href={TERMS_URL}>uslove korišćenja</a>
        </Button>{" "}
        i{" "}
        <Button asChild variant="underline" size="text" className="inline text-[13px] font-normal">
          <a href={PRIVACY_URL}>politiku privatnosti</a>
        </Button>
        .
      </p>
    </>
  );
}
