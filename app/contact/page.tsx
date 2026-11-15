import Image from "next/image"
import type {Metadata} from "next"
import ContactForm from "@/components/contact/ContactForm"
import {RichTextContent} from "@/components/cms/PageContent"
import {getPageById, getPageMetadata} from "@/sanity/data/pages"
import {urlFor} from "@/sanity/lib/image"
import type {SanityImageSource} from "@sanity/image-url"
import styles from "./page.module.css"

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("page-contact")
}

export default async function ContactPage() {
  const page = await getPageById("page-contact")
  const contactImageUrl = page?.contactImage?.asset ? urlFor(page.contactImage as SanityImageSource).width(1000).height(1300).fit("crop").url() : "/images/art/violin-stock-soft.png"

  return <main className={styles.page}>
    <header className={styles.header}>
      <h1 id="contact-heading">{page?.title || "Contact"}</h1>
      <p className={styles.excerpt}>{page?.excerpt || "Get in touch for artistic engagement or discussion."}</p>
      {page?.content?.length ? <div className={styles.cmsContent}><RichTextContent content={page.content} /></div> : null}
    </header>
    <section className={styles.panels}>
      <div className={styles.photo}>
        <Image src={contactImageUrl} alt={page?.contactImage?.alt || "Violin against a soft neutral background"} fill sizes="(max-width: 800px) 100vw, 33vw" className={styles.photoImage} />
      </div>
      <div className={styles.formPanel} aria-labelledby="contact-heading">
        <ContactForm heading={page?.contactFormHeading} />
      </div>
    </section>
  </main>
}
