import type {SanityImageSource} from "@sanity/image-url"
import styles from "./page.module.css"
import PhotoSlider from "@/components/home/PhotoSlider/PhotoSlider"
import QuoteSlider from "@/components/home/QuoteSlider/QuoteSlider"
import FeaturedInBar from "@/components/home/FeaturedInBar/FeaturedInBar"
import {getPageById} from "@/sanity/data/pages"
import {urlFor} from "@/sanity/lib/image"

export const revalidate = 60

export default async function Home() {
  const page = await getPageById("page-home")
  const gallery = page?.gallery?.flatMap((image) => image.asset ? [{src: urlFor(image as SanityImageSource).width(1000).height(1200).fit("crop").url(), alt: image.alt}] : [])
  const quotes = page?.quotes?.map((quote) => ({quote: quote.quote, attribution: quote.attribution}))
  const featuredIn = page?.featuredIn?.flatMap((item) => item.image?.asset ? [{name: item.name, url: item.url, src: urlFor(item.image as SanityImageSource).width(290).height(90).fit("max").url()}] : [])

  return <section className={styles.hero}>
    <div className={styles.portraitWrapper}><PhotoSlider photos={gallery} /></div>
    <div className={styles.quoteWrapper}>
      <QuoteSlider quotes={quotes} />
      <FeaturedInBar items={featuredIn} />
    </div>
  </section>
}
