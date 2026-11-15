"use client";

import {useEffect, useState} from "react";
import Image from "next/image";
import styles from "./PhotoSlider.module.css";

const photos = [
  {src: "/images/headshots/headshot-1.jpg", alt: "headshot"},
  {src: "/images/headshots/headshot-2.JPG", alt: "headshot with violin"},
];
const displayDuration = 12000;
const fadeDuration = 850;

type Photo = {src: string; alt?: string};

export default function PhotoSlider({photos: cmsPhotos}: {photos?: Photo[]}) {
  const displayPhotos = cmsPhotos?.length ? cmsPhotos : photos;
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (displayPhotos.length < 2) return;

    let fadeTimeout: number | undefined;
    const interval = window.setInterval(() => {
      setVisible(false);
      fadeTimeout = window.setTimeout(() => {
        setActiveIndex((index) => (index + 1) % displayPhotos.length);
        setVisible(true);
      }, fadeDuration);
    }, displayDuration);

    return () => {
      window.clearInterval(interval);
      if (fadeTimeout) window.clearTimeout(fadeTimeout);
    };
  }, [displayPhotos.length]);

  const displayedIndex = activeIndex % displayPhotos.length;
  const activePhoto = displayPhotos[displayedIndex];
  const side = displayedIndex % 2 === 0 ? styles.left : styles.right;

  return (
    <div className={styles.photoSlider}>
      <div className={styles.photoViewport}>
        <div className={`${styles.photoFrame} ${side} ${visible ? styles.visible : ""}`}>
          <Image
            className={styles.photo}
            src={activePhoto.src}
            alt={activePhoto.alt || "Katie Lansdale"}
            fill
            sizes="(max-width: 1099px) 100vw, 35vw"
            priority
          />
        </div>
      </div>
    </div>
  );
}
