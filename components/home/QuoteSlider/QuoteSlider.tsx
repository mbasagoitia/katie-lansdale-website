"use client";

import {useEffect, useState} from "react";
import styles from "./QuoteSlider.module.css";

const quotes = [
  {
    quote: "A stunning musician and wonderful soloist, communicating an infectious joy …a wonderful addition to the international music scene.",
    attribution: "Berliner Morgenpost",
  },
  {
    quote: "A first-class soloist.",
    attribution: "Boston Globe",
  },
  {
    quote: "It was a remarkable evening—one in which the music seemed as it must have when played the very first time, perhaps from still-damp manuscript paper. It was that revealing. It was that good.",
    attribution: "Raleigh-Durham Spectator, review of Lansdale's performance of the solo Bach violin works",
  },
];
const displayDuration = 12000;
const fadeDuration = 850;

type Quote = {quote: string; attribution?: string};

export default function QuoteSlider({quotes: cmsQuotes}: {quotes?: Quote[]}) {
  const displayQuotes = cmsQuotes?.length ? cmsQuotes : quotes;
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (displayQuotes.length < 2) return;

    let fadeTimeout: number | undefined;
    const interval = window.setInterval(() => {
      setVisible(false);
      fadeTimeout = window.setTimeout(() => {
        setActiveIndex((index) => (index + 1) % displayQuotes.length);
        setVisible(true);
      }, fadeDuration);
    }, displayDuration);

    return () => {
      window.clearInterval(interval);
      if (fadeTimeout) window.clearTimeout(fadeTimeout);
    };
  }, [displayQuotes.length]);

  const activeQuote = displayQuotes[activeIndex % displayQuotes.length];

  return (
    <aside className={styles.quotePanel}>
      <div className={styles.quoteBox}>
        <figure>
          <div className={`${styles.quoteDecoration} ${styles.quoteTop}`} aria-hidden="true" />
          <div className={`${styles.quoteContent} ${visible ? styles.visible : ""}`}>
            <blockquote>“{activeQuote.quote}”</blockquote>
            {activeQuote.attribution ? <figcaption>— {activeQuote.attribution}</figcaption> : null}
          </div>
          <div className={`${styles.quoteDecoration} ${styles.quoteBottom}`} aria-hidden="true" />
        </figure>
      </div>
    </aside>
  );
}
