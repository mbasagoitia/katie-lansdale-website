import Image from "next/image"
import type {Metadata} from "next"
import type {SanityImageSource} from "@sanity/image-url"
import {RichTextContent} from "@/components/cms/PageContent"
import {aboutPageSeed} from "@/sanity/content/aboutPageSeed"
import {getPageById, getPageMetadata} from "@/sanity/data/pages"
import {urlFor} from "@/sanity/lib/image"
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
  const excerpt = page?.excerpt || aboutPageSeed.excerpt
  const introduction = page?.aboutIntroduction?.length ? page.aboutIntroduction : aboutPageSeed.introduction
  const content = page?.content?.length ? page.content : aboutPageSeed.content

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
        />
      </div>
      <div className={styles.introTextWrapper}>
        <h1>{title}</h1>
        <p>{excerpt}</p>
        <RichTextContent content={introduction} />
      </div>
    </section>

    <hr className={styles.divider} />
    <div className={styles.bio}>
      <RichTextContent content={content} />
    </div>
  </>
}

function AboutFallback() {
  return <>
    <section className={styles.intro}>
      <div className={styles.portraitWrapper}>
        <Image className={styles.portrait} src="/images/headshots/headshot-3.jpg" alt="Katie Lansdale" width={4480} height={6720} />
      </div>
      <div className={styles.introTextWrapper}>
        <h1>About</h1>
        <p>Soloist. Chamber Musician. Educator. Artistic Catalyst.</p>
        <p>Violinist Katie Lansdale is widely acclaimed as soloist, chamber musician, educator, and artistic catalyst. She has performed as soloist and chamber artist on three continents, recording solo and trio CDs for Centaur and Triton Records.</p>
      </div>
    </section>

    <hr style={{borderTop: "1px solid #c6915f"}} />
    <div className={styles.bio}>
      <section>
        <h2>Performer</h2>
        <p>Lansdale&apos;s concerto appearances have included with the National Symphony, the Cleveland Chamber Symphony, the Austin Mozart Orchestra, the Schroeder Classical Orchestra, the NY Spectrum Orchestra, the Baltimore Symphony, the Piedmont Valley Orchestra, and the New York Repertory Orchestra. Lansdale performs on renowned concert series, including at the Phillips Collection, the Caramoor Series, Carnegie Hall&apos;s Weill Hall and Lincoln Center&apos;s Rose Room.</p>
        <p>Particularly widely acclaimed for performances of solo Bach, Lansdale has performed the complete cycle over a dozen times in North and South America. “This is one of the best recordings of this music,” wrote the American Record Guide of her Bach CD.</p>
        <p>Following her earlier presentation on solo Bach at Juilliard&apos;s Delay Symposium, Lansdale was recently invited to return in 2026 to share another passion of hers---violin works by composers from around the world. A passionate advocate for new and undiscovered music, Lansdale has performed premieres and unjustly forgotten works throughout the Eastern seabord. She was invited to present works by composers from under-represented groups at Juilliard&apos;s 2026 Delay Symposium. Lansdale is also honored to frequently perform music frequently by today&apos;s leading compositional voices, including commissioned works by Jerod Impachchaahaaha&apos; Tate and Evan Williams.</p>
      </section>

      <section>
        <h2>Chamber Musician</h2>
        <p>Winner of Grand Prizes at the Fischoff and Yellow Springs national chamber competitions, Lansdale has collaborated in chamber concerts with artists such as Yo Yo Ma, Donald Weilerstein, the Shanghai and Miami Quartets, and Charles Neidich.</p>
        <p>For over 35 years Lansdale has been a member of the internationally-acclaimed Lions Gate Trio, trio in residence at the University of Hartford, recording for Centaur and Triton records and performing across Europe and the Eastern US.</p>
        <p>In New York, where she founded the acclaimed Locrian new music group, Lansdale&apos;s extensive chamber music concerts have ranged from Mostly Mozart at Lincoln Center with Yo Yo Ma to Merkin Hall with the Twentieth Centuryists. With the Festival Chamber Society, she performed regularly for a decade in Carnegie Hall&apos;s Weill Hall.</p>
      </section>

      <section>
        <h2>Educator &amp; Artistic Leader</h2>
        <p>Lansdale has launched and led a number of projects that connect her work as performer, educator and artistic leader. In addition to founding the Lions Gate Trio, Lansdale is the creator and director of the Solo Strings Workshop at Promisek. She is also co-director of Ode to Joy, an extensive annual chamber festival in Hartford, CT. A champion of musical connections to children and communities, Lansdale reguarly joins her students in community engagement campaigns called Music for 1000 Children.</p>
      </section>

      <section>
        <h2>Education &amp; Teaching</h2>
        <p>A native of Washington D.C., Lansdale studied with Ronda Cole, Josef Gingold, Felix Galimir, Donald Weilerstein and Mitchell Stern. She graduated cum laude from Yale, where she was awarded prizes in both the arts and humanities, and earned graduate music degrees (M.M., D.M.A.) at the Cleveland Institute of Music and Manhattan School of Music.</p>
        <p>She has performed at numerous summer festival faculties, including Kneisel Hall Chamber Festival, the Amalfi Coast Chamber Festival (Italy), the Kuhmo Festival (Finland), Aria International Music Festival, and Music from Salem. Having taught at Boston University and at State University of New York-Stony Brook, Lansdale now serves on the faculty of the Hartt School at the University of Hartford and Boston Conservatory at Berklee.</p>
      </section>
    </div>
  </>
}
