import Image from "next/image";
import styles from "./FeaturedInBar.module.css";

export default function FeaturedInBar() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <div className={styles.line} />
        <span>FEATURED IN</span>
        <div className={styles.line} />
      </div>
      <div className={styles.logos}>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.logo} ${styles.strings}`}
          aria-label="Strings Magazine"
        >
          <Image
            src="/images/logos/strings-logo-black.png"
            alt="Strings Magazine"
            width={260}
            height={85}
          />
        </a>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.logo} ${styles.asta}`}
          aria-label="American String Teachers Association"
        >
          <Image
            src="/images/logos/asta-logo-black.png"
            alt="American String Teachers Association"
            width={260}
            height={85}
          />
        </a>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.logo} ${styles.suzuki}`}
          aria-label="Suzuki Association of the Americas"
        >
          <Image
            src="/images/logos/saa-logo-black.png"
            alt="Suzuki Association of the Americas"
            width={290}
            height={90}
          />
        </a>
      </div>
    </section>
  );
}