import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import type { EmailStepState } from "../hooks/useEmailStep";
import { BackButton } from "./BackButton";
import { StepHeading } from "./StepHeading";

interface EmailStepProps {
  email: EmailStepState;
  onBack: () => void;
  onSubmit: () => void;
}

export function EmailStep({ email, onBack, onSubmit }: EmailStepProps) {
  const empty = email.email.trim() === "";
  return (
    <div className="animate-[fadeUp_200ms_ease_both]">
      <BackButton onClick={onBack} />
      <StepHeading title="Unesi e-mail">Poslaćemo ti jednokratni kod za prijavu.</StepHeading>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="mt-7 flex flex-col gap-2"
      >
        <Label htmlFor="email" className="text-sm font-medium text-ink">
          E-mail
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          autoFocus
          placeholder="ime@email.com"
          value={email.email}
          onChange={(event) => email.setEmail(event.target.value)}
          aria-invalid={email.emailError !== null}
          aria-describedby={email.emailError ? "email-err" : undefined}
          variant="field"
        />
        {email.emailError && (
          <span id="email-err" role="alert" className="text-sm text-rust">
            {email.emailError}
          </span>
        )}
        <Button
          type="submit"
          variant="sage"
          size="cta"
          disabled={email.sending || empty}
          className="mt-3 gap-2.5 transition-opacity disabled:opacity-45"
        >
          {email.sending && <Spinner tone="cream" />}
          {email.sending ? "Šaljemo kod…" : "Pošalji kod"}
        </Button>
      </form>
    </div>
  );
}
