"use client";

import Image from "next/image";
import styles from "./PhotoSlider.module.css";

const photos = [
  {src: "/images/headshots/headshot-1.jpg", alt: "Katie Lansdale playing violin"},
  {src: "/images/headshots/headshot-2.JPG", alt: "Katie Lansdale with her violin"},
];

type Photo = {src: string; alt?: string};

export default function PhotoSlider({photos: cmsPhotos}: {photos?: Photo[]}) {
  const displayPhotos = cmsPhotos?.length ? cmsPhotos : photos;
  return (
    <div className={styles.photoSlider}>
      <div className={styles.photoViewport}>
        {displayPhotos.map((photo, i) => (
          <div key={photo.src} className={`${styles.photoFrame} ${i === 0 ? styles.left : styles.right}`}>
            <Image
              className={styles.photo}
              src={photo.src}
              alt={photo.alt || "Katie Lansdale"}
              fill
              sizes="(max-width: 700px) 48vw, 35vw"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
