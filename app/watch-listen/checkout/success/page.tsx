import Link from "next/link"
import styles from "./page.module.css"

export default function CheckoutSuccessPage() {
  return <main className={styles.page}>
    <p className={styles.eyebrow}>Test payment complete</p>
    <h1>Thank you.</h1>
    <p>Your Stripe test transaction was completed. A confirmation is addressed to Marika Basagoitia.</p>
    <Link href="/watch-listen">Return to Watch / Listen</Link>
  </main>
}
