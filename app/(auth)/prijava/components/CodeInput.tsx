import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
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
  const slot = cn(
    "h-[60px] w-auto max-w-[56px] flex-1 rounded-[14px] border text-2xl font-semibold tabular-nums text-ink shadow-none transition-[border-color,box-shadow] duration-100",
    "first:rounded-[14px] last:rounded-[14px] data-[active=true]:z-0 data-[active=true]:border-sage data-[active=true]:ring-[3px] data-[active=true]:ring-sage/18",
    invalid ? "border-rust" : "border-line",
    blocked ? "bg-sand" : "bg-white"
  );
  return (
    <InputOTP
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
          <InputOTPSlot key={i} index={i} className={slot} />
        ))}
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup className="min-w-0 flex-1 gap-2">
        {Array.from({ length: half }, (_, i) => (
          <InputOTPSlot key={i} index={half + i} className={slot} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}
