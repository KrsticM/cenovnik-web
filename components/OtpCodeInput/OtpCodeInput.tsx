"use client";

import { useRef, useState } from "react";
import styles from "./OtpCodeInput.module.css";

interface OtpCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export function OtpCodeInput({ value, onChange, disabled = false }: OtpCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleChange = (index: number, newValue: string) => {
    const digit = newValue.replace(/\D/g, "").slice(-1);
    const newCode = value.split("");
    newCode[index] = digit;
    const codeStr = newCode.join("").slice(0, 6);
    onChange(codeStr);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pastedText);
    if (pastedText.length === 6) {
      inputRefs.current[5]?.focus();
    } else if (pastedText.length > 0) {
      inputRefs.current[Math.min(pastedText.length, 5)]?.focus();
    }
  };

  return (
    <div className={styles.container}>
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          disabled={disabled}
          className={`${styles.box} ${focusedIndex === index ? styles.focused : ""}`}
        />
      ))}
    </div>
  );
}
