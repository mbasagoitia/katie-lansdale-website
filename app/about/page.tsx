import Image from "next/image"
import type {Metadata} from "next"
import type {SanityImageSource} from "@sanity/image-url"
import {RichTextContent} from "@/components/cms/PageContent"
import {aboutPageSeed} from "@/sanity/content/aboutPageSeed"
import {getPageById, getPageMetadata} from "@/sanity/data/pages"
import {urlFor} from "@/sanity/lib/image"
import {warmImagePlaceholder} from "@/lib/image-placeholder"
import type {AboutBiographySection} from "@/types/page"
import styles from "./page.module.css"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("page-about")
}

export default async function About() {
  const page = await getPageById("page-about")

  if (!page) return <AboutFallback />

  return <AboutPage page={page} />
}

function AboutPage({page}: {page: Awaited<ReturnType<typeof getPageById>>}) {
  const heroImageUrl = page?.heroImage?.asset
    ? urlFor(page.heroImage as SanityImageSource).width(900).height(1350).fit("crop").url()
    : null
  const title = page?.title || aboutPageSeed.title
  const tagline = page?.aboutTagline || aboutPageSeed.excerpt
  const introduction = page?.aboutIntroduction?.length ? page.aboutIntroduction : aboutPageSeed.introduction
  const biographySections = page?.aboutBiographySections?.length ? page.aboutBiographySections : aboutPageSeed.biographySections

  return <>
    <section className={styles.intro}>
      <div className={styles.portraitWrapper}>
        <Image
          className={styles.portrait}
          src={heroImageUrl || "/images/headshots/headshot-3.jpg"}
          alt={page?.heroImage?.alt || "Katie Lansdale"}
          width={4480}
          height={6720}
          sizes="(max-width: 1099px) 350px, 430px"
          placeholder="blur"
          blurDataURL={warmImagePlaceholder}
          unoptimized
        />
      </div>
      <div className={styles.introTextWrapper}>
        <h1>{title}</h1>
        <p>{tagline}</p>
        <RichTextContent content={introduction} />
      </div>
    </section>

    <hr className={styles.divider} />
    <BiographySections sections={biographySections} />
  </>
}

function BiographySections({sections}: {sections: AboutBiographySection[]}) {
  return <div className={styles.bio}>
    {sections.map((section) => <section key={section._key}>
      <h2>{section.heading}</h2>
      {section.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph.trim()}</p>)}
    </section>)}
  </div>
}

function AboutFallback() {
  return <>
    <section className={styles.intro}>
      <div className={styles.portraitWrapper}>
        <Image className={styles.portrait} src="/images/headshots/headshot-3.jpg" alt="Katie Lansdale" width={4480} height={6720} placeholder="blur" blurDataURL={warmImagePlaceholder} unoptimized />
      </div>
      <div className={styles.introTextWrapper}>
        <h1>About</h1>
        <p>Soloist. Chamber Musician. Educator. Artistic Catalyst.</p>
        <p>Violinist Katie Lansdale is widely acclaimed as soloist, chamber musician, educator, and artistic catalyst. She has performed as soloist and chamber artist on three continents, recording solo and trio CDs for Centaur and Triton Records.</p>
      </div>
    </section>

    <hr className={styles.divider} />
    <BiographySections sections={aboutPageSeed.biographySections} />
  </>
}
