import Image from "next/image"
import {PortableText} from "@portabletext/react"
import type {TypedObject} from "@portabletext/types"
import type {SanityImageSource} from "@sanity/image-url"
import styles from "./PageContent.module.css"
import {urlFor} from "@/sanity/lib/image"
import type {CmsPage, SanityImage} from "@/types/page"

type Props = {
  page: CmsPage | null
  fallbackTitle: string
  fallbackExcerpt?: string
  fallbackContent?: React.ReactNode
  className?: string
}

export default function PageContent({page, fallbackTitle, fallbackExcerpt, fallbackContent, className}: Props) {
  const title = page?.title || fallbackTitle
  const excerpt = page?.excerpt || fallbackExcerpt
  const hasCmsContent = Boolean(page?.content?.length)
  const heroImageUrl = page?.heroImage ? imageUrl(page.heroImage, 1500, 850) : null

  return <article className={`${styles.page} ${className || ""}`}>
    <header className={styles.header}>
      {heroImageUrl && <div className={styles.hero}><Image src={heroImageUrl} alt={page?.heroImage?.alt || title} fill sizes="(max-width: 900px) 100vw, 900px" className={styles.heroImage} /></div>}
      <h1>{title}</h1>
      {excerpt && <p className={styles.excerpt}>{excerpt}</p>}
    </header>
    <div className={styles.content}>
      {hasCmsContent ? <RichTextContent content={page?.content || []} /> : fallbackContent}
    </div>
  </article>
}

export function RichTextContent({content}: {content: TypedObject[]}) {
  return <PortableText value={content} components={portableTextComponents} />
}

function PortableImage({value}: {value: SanityImage}) {
  const src = imageUrl(value, 1200, 800)
  if (!src) return null
  return <figure className={styles.contentImage}><Image src={src} alt={value.alt || ""} width={1200} height={800} sizes="(max-width: 900px) 100vw, 900px" /></figure>
}

function imageUrl(image: SanityImage, width: number, height: number): string | null {
  return image.asset ? urlFor(image as SanityImageSource).width(width).height(height).fit("crop").url() : null
}

const portableTextComponents = {
  block: {
    h2: ({children}: {children?: React.ReactNode}) => <h2>{children}</h2>,
    h3: ({children}: {children?: React.ReactNode}) => <h3>{children}</h3>,
    normal: ({children}: {children?: React.ReactNode}) => <p>{children}</p>,
  },
  types: {
    image: PortableImage,
  },
}
