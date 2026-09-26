"use client"

import {useRef, useState} from "react"
import Image from "next/image"
import styles from "./RecordingPlayer.module.css"

type Props = {
  audioUrl: string
  coverArtUrl: string
  coverArtAlt: string
  title: string
}

export default function RecordingPlayer({audioUrl, coverArtUrl, coverArtAlt, title}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  async function togglePlayback() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) await audio.play()
    else audio.pause()
  }

  return <div className={styles.player}>
    <button type="button" className={styles.coverButton} onClick={togglePlayback} aria-label={`${isPlaying ? "Pause" : "Play"} ${title}`}>
      <Image src={coverArtUrl} alt={coverArtAlt} fill sizes="(max-width: 700px) 100vw, 30vw" className={styles.coverArt} />
      <span className={styles.playIndicator} aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
      <span className={styles.playPrompt}>{isPlaying ? "Now playing" : "Play recording"}</span>
    </button>
    <audio ref={audioRef} controls preload="metadata" src={audioUrl} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />
  </div>
}
