import Image from "next/image";
import styles from "./SocialSignInButton.module.css";

interface SocialSignInButtonProps {
  variant: "apple" | "google" | "email";
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const getIcon = (variant: "apple" | "google" | "email") => {
  if (variant === "apple") {
    return (
      <Image src="/apple-icon.png" alt="Apple" width={22} height={22} />
    );
  }

  if (variant === "google") {
    return (
      <Image src="/google-icon.png" alt="Google" width={20} height={20} />
    );
  }

  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="#FFA500">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
};

export function SocialSignInButton({
  variant,
  label,
  onClick,
  disabled = false,
  loading = false,
}: SocialSignInButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={styles.button}
    >
      <div className={styles.iconSlot}>{getIcon(variant)}</div>
      <span className={styles.label}>{loading ? "Učitavam..." : label}</span>
      <div className={styles.iconSlot} />
    </button>
  );
}
