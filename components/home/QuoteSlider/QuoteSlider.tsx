import styles from "./QuoteSlider.module.css";

const quotes = [
  {
    quote: '"This is one of the best recordings of this music."',
    attribution: "American Record Guide on her Bach CD",
  },
  {
    quote:
      '“These three stunning musicians are wonderful soloists, and as a team, unbeatable. They communicate joy in music-making not only in technical brilliance but in an unbelievable playful lightness, and their joy is infectious…a wonderful addition to the international music scene.”',
    attribution: "Berliner Morgenpost on the Lions Gate Trio",
  },
  {
    quote:
      '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore rmagna aliqua."',
    attribution: "placeholder attribution 2",
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
              <blockquote>{q.quote}</blockquote>
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
