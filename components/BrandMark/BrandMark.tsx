import Image from "next/image";
import styles from "./BrandMark.module.css";

interface BrandMarkProps {
  size?: "sm" | "md";
  showImage?: boolean;
}

export function BrandMark({ size = "md", showImage = false }: BrandMarkProps) {
  return (
    <div className={`${styles.mark} ${styles[size]}`}>
      {showImage ? (
        <Image
          src="/icon.png"
          alt=""
          width={size === "sm" ? 36 : 52}
          height={size === "sm" ? 36 : 52}
          className={styles.image}
        />
      ) : (
        <span>e</span>
      )}
    </div>
  );
}
