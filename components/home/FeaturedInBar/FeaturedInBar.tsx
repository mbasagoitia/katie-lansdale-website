import Image from "next/image";
import styles from "./FeaturedInBar.module.css";

type FeaturedItem = {name: string; src: string; url?: string; className?: string};

const defaultItems: FeaturedItem[] = [
  {name: "Strings Magazine", src: "/images/logos/strings-logo-black.png", className: styles.strings},
  {name: "American String Teachers Association", src: "/images/logos/asta-logo-black.png", className: styles.asta},
  {name: "Suzuki Association of the Americas", src: "/images/logos/saa-logo-black.png", className: styles.suzuki},
];

export default function FeaturedInBar({items}: {items?: FeaturedItem[]}) {
  const displayItems = items?.length ? items : defaultItems;
  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <div className={styles.line} />
        <span>FEATURED IN</span>
        <div className={styles.line} />
      </div>
      <div className={styles.logos}>
        {displayItems.map((item) => <a key={item.name} href={item.url || undefined} target={item.url ? "_blank" : undefined} rel={item.url ? "noopener noreferrer" : undefined} className={`${styles.logo} ${item.className || ""}`} aria-label={item.name}>
          <Image src={item.src} alt={item.name} width={290} height={90} />
        </a>)}
      </div>
    </section>
  );
}
