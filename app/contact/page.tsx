import Image from "next/image"
import type {SanityImageSource} from "@sanity/image-url"
import ContactForm from "@/components/contact/ContactForm"
import {RichTextContent} from "@/components/cms/PageContent"
import {getPageById} from "@/sanity/data/pages"
import {urlFor} from "@/sanity/lib/image"
import styles from "./page.module.css"

export const revalidate = 60

export default async function ContactPage() {
  const page = await getPageById("page-contact")
  const photoUrl = page?.heroImage?.asset ? urlFor(page.heroImage as SanityImageSource).width(1000).height(1200).fit("crop").url() : null

  return <main className={styles.page}>
    <section className={styles.intro}>
      <div className={styles.photo}>
        {photoUrl ? <Image src={photoUrl} alt={page?.heroImage?.alt || "Katie Lansdale"} fill sizes="(max-width: 800px) 100vw, 45vw" className={styles.photoImage} /> : <p>Photo of Katie&apos;s violin</p>}
      </div>
      <div className={styles.introText}>
        <p className={styles.eyebrow}>Get in touch</p>
        <h1>{page?.title || "Contact"}</h1>
        <p className={styles.excerpt}>{page?.excerpt || "For concert engagements, collaborations, teaching, and general inquiries, please use the form below."}</p>
        {page?.content?.length ? <div className={styles.cmsContent}><RichTextContent content={page.content} /></div> : null}
      </div>
    </section>

    <section className={styles.formSection} aria-labelledby="contact-form-heading">
      <div>
        <p className={styles.eyebrow}>Send a message</p>
        <h2 id="contact-form-heading">How can we help?</h2>
      </div>
      <ContactForm />
    </section>
  </main>
}
