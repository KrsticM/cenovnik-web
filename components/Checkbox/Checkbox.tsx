import { Checkbox as RadixCheckbox } from "@/components/ui/checkbox";
import styles from "./Checkbox.module.css";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}

export function Checkbox({ checked, onChange, ariaLabel }: CheckboxProps) {
  return (
    <RadixCheckbox
      checked={checked}
      onCheckedChange={() => onChange()}
      aria-label={ariaLabel}
      className={styles.checkbox}
    />
  );
}
