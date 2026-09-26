"use client";

import Image from "next/image";
import styles from "./PhotoSlider.module.css";

const photos = [
  {src: "/images/headshots/headshot-1-cream.jpeg", alt: "Katie Lansdale playing violin"},
  {src: "/images/headshots/headshot-2-cream.png", alt: "Katie Lansdale"},
];

type Photo = {src: string; alt?: string};

export default function PhotoSlider({photos: cmsPhotos}: {photos?: Photo[]}) {
  const displayPhotos = cmsPhotos?.length ? cmsPhotos : photos;
  return (
    <div className={styles.photoSlider}>
      <div className={styles.photoViewport}>
        {displayPhotos.map((photo, i) => (
          <Image
            key={photo.src}
            className={styles.photo}
            src={photo.src}
            alt={photo.alt || "Katie Lansdale"}
            width={1000}
            height={1200}
            priority={i === 0}
          />
        ))}
      </div>
    </div>
  );
}
