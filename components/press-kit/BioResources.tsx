"use client"

import {useEffect, useState} from "react"
import styles from "./BioResources.module.css"

type Bio = {
  id: "short" | "long"
  title: string
  paragraphs: string[]
}

type Props = {
  bios: Bio[]
}

export default function BioResources({bios}: Props) {
  const [activeBio, setActiveBio] = useState<Bio | null>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveBio(null)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return <>
    <div className={styles.cards}>
      {bios.map((bio) => <article className={styles.card} key={bio.id}>
        <h3>{bio.title}</h3>
        <div className={styles.actions}>
          <button type="button" onClick={() => setActiveBio(bio)}>View biography <span aria-hidden="true">↗</span></button>
          <a href={`/api/press-kit/bio/${bio.id}`}>Download PDF <span aria-hidden="true">↓</span></a>
        </div>
      </article>)}
    </div>

    {activeBio && <div className={styles.backdrop} role="presentation" onClick={() => setActiveBio(null)}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby={`bio-${activeBio.id}-title`} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 id={`bio-${activeBio.id}-title`}>{activeBio.title}</h2>
          </div>
          <button className={styles.closeButton} type="button" onClick={() => setActiveBio(null)} aria-label="Close biography">×</button>
        </div>
        <div className={styles.modalBody}>
          {activeBio.paragraphs.map((paragraph, index) => <p key={`${activeBio.id}-${index}`}>{paragraph}</p>)}
        </div>
        <a className={styles.modalDownload} href={`/api/press-kit/bio/${activeBio.id}`}>Download PDF <span aria-hidden="true">↓</span></a>
      </section>
    </div>}
  </>
}
