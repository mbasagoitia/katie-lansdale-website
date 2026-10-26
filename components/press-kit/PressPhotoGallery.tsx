"use client"

import Image from "next/image"
import {useEffect, useState} from "react"
import styles from "./PressPhotoGallery.module.css"

export type GalleryPhoto = {key: string; src: string; alt: string; label: string}

export default function PressPhotoGallery({photos}: {photos: GalleryPhoto[]}) {
  const [activePhoto, setActivePhoto] = useState<GalleryPhoto | null>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActivePhoto(null)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return <>
    <div className={styles.grid}>
      {photos.map((photo) => <button className={styles.photoButton} key={photo.key} type="button" onClick={() => setActivePhoto(photo)} aria-label={`View ${photo.label}`}>
        <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 33vw" className={styles.thumbnail} />
        <span className={styles.caption}>{photo.label}</span>
      </button>)}
    </div>

    {activePhoto && <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={activePhoto.label} onClick={() => setActivePhoto(null)}>
      <button className={styles.closeButton} type="button" onClick={() => setActivePhoto(null)} aria-label="Close photo viewer">×</button>
      <div className={styles.lightboxImage} onClick={(event) => event.stopPropagation()}>
        <Image src={activePhoto.src} alt={activePhoto.alt} fill sizes="90vw" className={styles.fullImage} />
      </div>
    </div>}
  </>
}
