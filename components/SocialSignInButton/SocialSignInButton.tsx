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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 13.5c-.73 0-1.38.35-1.8.88-.42.53-.65 1.29-.65 2.12 0 .83.23 1.59.65 2.12.42.53 1.07.88 1.8.88.73 0 1.38-.35 1.8-.88.42-.53.65-1.29.65-2.12 0-.83-.23-1.59-.65-2.12-.42-.53-1.07-.88-1.8-.88zm-10.1 0c-.73 0-1.38.35-1.8.88C4.73 15.91 4.5 16.67 4.5 17.5c0 .83.23 1.59.65 2.12.42.53 1.07.88 1.8.88.73 0 1.38-.35 1.8-.88.42-.53.65-1.29.65-2.12 0-.83-.23-1.59-.65-2.12-.42-.53-1.07-.88-1.8-.88zm5 5c-1.67 0-3 1.33-3 3s1.33 3 3 3 3-1.33 3-3-1.33-3-3-3z" />
      </svg>
    );
  }

  if (variant === "google") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
      className={`${styles.button} ${styles[variant]}`}
    >
      <div className={styles.iconSlot}>{getIcon(variant)}</div>
      <span className={styles.label}>{loading ? "Učitavam..." : label}</span>
      <div className={styles.iconSlot} />
    </button>
  );
}
