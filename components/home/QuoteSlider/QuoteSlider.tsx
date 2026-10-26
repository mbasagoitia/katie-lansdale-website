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

type Quote = {quote: string; attribution?: string};

export default function QuoteSlider({quotes: cmsQuotes}: {quotes?: Quote[]}) {
  const displayQuotes = cmsQuotes?.length ? cmsQuotes : quotes;
  return (
    <aside className={styles.quotePanel}>
      <div className={styles.quoteBox}>
        {displayQuotes.map((q, i) => (
          <figure key={q.quote + i}>
            <div
              className={`${styles.quoteDecoration} ${styles.quoteTop}`}
              aria-hidden="true"
            >
            </div>

            <div className={styles.quoteContent}>
              <blockquote>“{q.quote}”</blockquote>
              <figcaption>— {q.attribution}</figcaption>
            </div>

            <div
              className={`${styles.quoteDecoration} ${styles.quoteBottom}`}
              aria-hidden="true"
            >
            </div>
          </figure>
        ))}
      </div>
    </aside>
  );
}
