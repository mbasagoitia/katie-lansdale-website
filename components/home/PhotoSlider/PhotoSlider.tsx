"use client";

import Image from "next/image";
import styles from "./PhotoSlider.module.css";

const photos = [
  "/images/headshots/headshot-1-cream.jpeg",
  "/images/headshots/headshot-2-cream.png",
];

export default function PhotoSlider() {
  return (
    <div className={styles.photoSlider}>
      <div className={styles.photoViewport}>
        {photos.map((src, i) => (
          <Image
            key={src}
            className={styles.photo}
            src={src}
            alt="Katie Lansdale"
            width={1000}
            height={1200}
            priority={i === 0}
          />
        ))}
      </div>
      {/* <Image
        className={styles.border}
        src="/images/background-images/rock-photo-border.png"
        alt=""
        fill
        priority
        sizes="(min-width: 1100px) 50vw, 100vw"
      /> */}
    </div>
  );
}