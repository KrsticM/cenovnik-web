import Image from "next/image";
import styles from "./BrandMark.module.css";

interface BrandMarkProps {
  size?: "sm" | "md";
  showImage?: boolean;
}

export function BrandMark({ size = "md", showImage = false }: BrandMarkProps) {
  const sizeMap = { sm: 36, md: 52 };
  const imageSize = sizeMap[size] || 52;

  return (
    <div className={`${styles.mark} ${styles[size]}`}>
      {showImage ? (
        <Image
          src="/icon.png"
          alt=""
          width={imageSize}
          height={imageSize}
          className={styles.image}
        />
      ) : (
        <span>e</span>
      )}
    </div>
  );
}
