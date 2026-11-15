import Link from "next/link"
import styles from "../success/page.module.css"

export default function CheckoutCancelPage() {
  return <main className={styles.page}>
    <p className={styles.eyebrow}>Test checkout cancelled</p>
    <h1>No payment was made.</h1>
    <p>Your cart remains available on the Watch / Listen page whenever you are ready to continue testing.</p>
    <Link href="/watch-listen">Return to Watch / Listen</Link>
  </main>
}
