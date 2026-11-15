"use client"

import Image from "next/image"
import {useEffect, useState} from "react"
import type {ProjectCard} from "@/types/page"
import {warmImagePlaceholder} from "@/lib/image-placeholder"
import {urlFor} from "@/sanity/lib/image"
import type {SanityImageSource} from "@sanity/image-url"
import styles from "./ProjectFeature.module.css"

export default function ProjectFeature({card}: {card: ProjectCard}) {
  const [isOpen, setIsOpen] = useState(false)
  const action = card.contentAction || (card.linkUrl ? "link" : card.details ? "details" : "none")
  const hasDetails = action === "details" && Boolean(card.details)
  const hasLink = action === "link" && Boolean(card.linkUrl)
  const imageUrl = card.image?.asset ? urlFor(card.image as SanityImageSource).width(1200).url() : card.imageUrl

  useEffect(() => {
    if (!isOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [isOpen])

  const content = <>
    <div className={styles.imageWrap}>
      {imageUrl
        ? <Image src={imageUrl} alt={card.image?.alt || ""} fill sizes="(max-width: 760px) 100vw, 50vw" className={`${styles.image} ${card._key === "promisek-solo-strings-workshops" ? styles.imageZoomed : ""}`} style={{objectPosition: card.imagePosition}} placeholder="blur" blurDataURL={warmImagePlaceholder} unoptimized={!card.image?.asset} />
        : <div className={styles.imageFallback} aria-hidden="true"><span>Photo<br />coming soon</span></div>}
    </div>
    <div className={styles.content}>
      {card.category && <p className={styles.category}>{card.category}</p>}
      <h2>{card.title}</h2>
      {card.description && <p className={styles.description}>{card.description}</p>}
      {(hasLink || hasDetails) && <span className={styles.linkLabel}>{card.linkLabel || "Learn more"} <span aria-hidden="true">{hasLink ? "↗" : "→"}</span></span>}
    </div>
  </>

  return <>
    {hasLink
      ? <a className={styles.card} href={card.linkUrl} target="_blank" rel="noreferrer">{content}</a>
      : hasDetails
        ? <button className={styles.card} type="button" onClick={() => setIsOpen(true)} aria-haspopup="dialog">{content}</button>
        : <article className={styles.card}>{content}</article>}

    {isOpen && <div className={styles.dialogBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false) }}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={`${card._key}-title`}>
        <button className={styles.closeButton} type="button" onClick={() => setIsOpen(false)} aria-label={`Close ${card.title} details`}>×</button>
        {card.category && <p className={styles.category}>{card.category}</p>}
        <h2 id={`${card._key}-title`}>{card.title}</h2>
        {card.details?.split(/\n\n+/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </section>
    </div>}
  </>
}
