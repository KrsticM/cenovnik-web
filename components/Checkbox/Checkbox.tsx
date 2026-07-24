import styles from "./Checkbox.module.css";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}

export function Checkbox({ checked, onChange, ariaLabel }: CheckboxProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={checked}
      onClick={onChange}
      className={`${styles.checkbox} ${checked ? styles.checked : ""}`}
    >
      <span>✓</span>
    </button>
  );
}
