import type {Metadata} from "next"
import Image from "next/image"
import QRCode from "qrcode"
import {getPageById, getPageMetadata} from "@/sanity/data/pages"
import {urlFor} from "@/sanity/lib/image"
import type {DonationOption, SanityImage} from "@/types/page"
import styles from "./page.module.css"

export const revalidate = 60

const pageId = "page-donations"

const fallbackOptions: DonationOption[] = [
  {
    _key: "toccata-concert-series",
    title: "Viva La Musica",
    organization: "Toccata Concert Series",
    description: "Music should be vibrant, shared, and alive for all. Your tax-deductible gift supports Katie Lansdale’s artistic projects—from recordings and collaborations across the arts to music shared with children, audiences, and new work still to be imagined.",
    donationUrl: "https://www.zeffy.com/en-US/donation-form/viva-la-musica",
    linkLabel: "Donate via Zeffy",
  },
]

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata(pageId)
}

export default async function DonationsPage() {
  const page = await getPageById(pageId)
  const options = page?.donationOptions?.length ? page.donationOptions : fallbackOptions
  const cards = await Promise.all(options.map(async (option) => ({
    option,
    generatedQrCode: option.donationUrl ? await makeQrCode(option.donationUrl) : null,
  })))

  return <main className={styles.page}>
    <header className={styles.header}>
      <h1>{page?.title || "Donations"}</h1>
      <p className={styles.excerpt}>{page?.excerpt || "Help sustain the artistic, educational, and community work that brings music to life. Gifts help make room for music to be created, shared, and experienced—on stage, in the studio, and in the wider community."}</p>
    </header>

    <section className={styles.options} aria-label="Ways to donate">
      {cards.map(({option, generatedQrCode}) => <DonationCard key={option._key} option={option} generatedQrCode={generatedQrCode} />)}
    </section>
  </main>
}

async function makeQrCode(url: string): Promise<string | null> {
  try {
    return await QRCode.toDataURL(url, {
      width: 280,
      margin: 1,
      errorCorrectionLevel: "M",
      color: {dark: "#5c3a21", light: "#fffaf5"},
    })
  } catch {
    return null
  }
}

function DonationCard({option, generatedQrCode}: {option: DonationOption; generatedQrCode: string | null}) {
  const customQrCode = qrCodeUrl(option.qrCode)
  const qrCode = customQrCode || generatedQrCode
  const donationIsReady = Boolean(option.donationUrl)

  return <article className={styles.card}>
    <div className={styles.cardContent}>
      {option.organization && <p className={styles.organization}>{option.organization}</p>}
      <h2>{option.title}</h2>
      {option.description ? <p className={styles.description}>{option.description}</p> : <p className={styles.comingSoon}>Donation details will be added soon.</p>}
      {donationIsReady ? <a className={styles.button} href={option.donationUrl} target="_blank" rel="noreferrer">{option.linkLabel || "Donate online"} <span aria-hidden="true">↗</span></a> : <span className={styles.pending}>{option.linkLabel || "Donation link coming soon"}</span>}
    </div>

    <aside className={styles.qrPanel} aria-label={donationIsReady ? `Donate to ${option.title} from your phone` : undefined}>
      {qrCode ? <>
        <p className={styles.qrLabel}>Donate from your phone</p>
        {customQrCode ? <Image className={styles.qrCode} src={customQrCode} alt={option.qrCode?.alt || `QR code to donate to ${option.title}`} width={280} height={280} /> : <img className={styles.qrCode} src={qrCode} alt={`QR code to donate to ${option.title}`} width={280} height={280} />}
        <p className={styles.qrHelp}>Scan to open the donation form.</p>
      </> : <p className={styles.qrPending}>A mobile donation code will appear here when the link is ready.</p>}
    </aside>
  </article>
}

function qrCodeUrl(image?: SanityImage): string | null {
  return image?.asset ? urlFor(image).width(560).height(560).fit("max").url() : null
}
