import Image from "next/image";
import styles from "./banner.module.css";

export default function Banner() {
    return (
    <header className={styles.banner}>
      <Image
          src="/images/art/rock-art.png"
          alt=""
          width={1920}
          height={175}
          priority
          className={styles.image}
      />
      </header>
    )
}