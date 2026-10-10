"use client";

import { CheckCircle } from "@/components/ui/check-circle";
import { Card } from "@/components/ui/card";
import { describeNext } from "../signinRules";
import { useSigninFlow, type OAuthError } from "../hooks/useSigninFlow";
import { CodeStep } from "./CodeStep";
import { EmailStep } from "./EmailStep";
import { StartStep } from "./StartStep";
import { StatusStep } from "./StatusStep";

interface SigninFlowProps {
  next: string;
  initialOAuthError: OAuthError | null;
}

export function SigninFlow(props: SigninFlowProps) {
  const flow = useSigninFlow(props);
  const returnTo = describeNext(props.next);

  return (
    <main aria-label="Prijava" className="relative flex min-h-screen flex-1 items-center justify-center px-4 py-8">
      <Card className="w-full max-w-[440px] rounded-[24px] border-line bg-white p-[clamp(24px,6vw,44px)] shadow-[0_20px_50px_rgba(26,26,26,0.06)]">
        {flow.step === "start" && (
          <StartStep
            returnTo={returnTo}
            oauth={flow.oauth}
            oauthError={flow.oauthError}
            onOAuth={flow.startOAuth}
            onEmail={flow.toEmail}
          />
        )}
        {flow.step === "email" && <EmailStep email={flow.email} onBack={flow.toStart} onSubmit={flow.sendCode} />}
        {flow.step === "code" && <CodeStep email={flow.email} onBack={flow.toEmail} />}
        {flow.step === "done" && (
          <StatusStep
            icon={<CheckCircle size="lg" />}
            title="Uspešna prijava"
            text={returnTo ? `Vraćamo te na ${returnTo}.` : "Vodimo te na proizvode."}
            status="Preusmeravamo te…"
          />
        )}
      </Card>
    </main>
  );
}
