import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import type { EmailCodeState } from "../hooks/useEmailCode";
import { BackButton } from "./BackButton";
import { CODE_TTL_MS } from "../signinRules";
import { CodeInput } from "./CodeInput";
import { StepHeading } from "./StepHeading";

interface CodeStepProps {
  email: EmailCodeState;
  onBack: () => void;
}

const formatWait = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export function CodeStep({ email, onBack }: CodeStepProps) {
  return (
    <div className="animate-[fadeUp_200ms_ease_both]">
      <BackButton onClick={onBack} />
      <StepHeading title="Unesi kod">
        Poslali smo šestocifreni kod na <strong className="font-semibold text-ink [overflow-wrap:anywhere]">{email.email}</strong>.{" "}
        <Button variant="underline" size="text" onClick={onBack} className="inline text-base font-medium">
          Promeni
        </Button>
      </StepHeading>

      <CodeInput
        value={email.code}
        onChange={email.changeCode}
        invalid={email.codeError !== null}
        disabled={email.blocked || email.verifying}
        blocked={email.blocked}
      />

      <div aria-live="polite" className="mt-3.5 min-h-[22px] text-sm leading-[1.45] text-pretty">
        {email.verifying ? (
          <span className="flex items-center gap-2 text-ink-muted">
            <Spinner size={14} />
            Proveravamo kod…
          </span>
        ) : email.codeError ? (
          <span role="alert" className="text-rust">
            {email.codeError}
          </span>
        ) : email.notice ? (
          <span className="text-sage-dark">{email.notice}</span>
        ) : (
          <span className="text-ink-muted">Kod važi {CODE_TTL_MS / 60_000} minuta.</span>
        )}
      </div>

      <Separator className="mt-6 bg-line-soft" />
      <div className="flex flex-col gap-4 pt-5">
        {email.canResend ? (
          <Button variant="pill" onClick={email.resend} disabled={email.resending} className="h-10 self-start rounded-full px-[18px] focus-visible:ring-offset-[3px]">
            Pošalji novi kod
          </Button>
        ) : (
          <span className="text-sm tabular-nums text-ink-muted">Novi kod možeš da zatražiš za {formatWait(email.resendIn)}</span>
        )}
        <span className="text-[13px] leading-normal text-ink-muted text-pretty">Ne vidiš e-mail? Proveri spam i promocije.</span>
      </div>
    </div>
  );
}
