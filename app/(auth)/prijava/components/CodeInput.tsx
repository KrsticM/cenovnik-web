import { useEffect, useRef } from "react";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { CODE_LENGTH } from "../signinRules";

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  invalid: boolean;
  disabled: boolean;
  blocked: boolean;
}

const half = CODE_LENGTH / 2;

export function CodeInput({ value, onChange, invalid, disabled, blocked }: CodeInputProps) {
  const input = useRef<HTMLInputElement>(null);
  // A disabled input drops focus while the code is checked; bring it back for the next try.
  useEffect(() => {
    if (!disabled) input.current?.focus();
  }, [disabled]);

  return (
    <InputOTP
      ref={input}
      maxLength={CODE_LENGTH}
      value={value}
      onChange={onChange}
      disabled={disabled}
      autoFocus
      inputMode="numeric"
      pattern="^[0-9]*$"
      autoComplete="one-time-code"
      aria-label={`Kod za prijavu, ${CODE_LENGTH} cifara`}
      aria-invalid={invalid}
      containerClassName="mt-7 gap-2 has-[:disabled]:opacity-100"
    >
      <InputOTPGroup className="min-w-0 flex-1 gap-2">
        {Array.from({ length: half }, (_, i) => (
          <InputOTPSlot key={i} index={i} boxed invalid={invalid} muted={blocked} />
        ))}
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup className="min-w-0 flex-1 gap-2">
        {Array.from({ length: half }, (_, i) => (
          <InputOTPSlot key={i} index={half + i} boxed invalid={invalid} muted={blocked} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
