import PageContent from "@/components/cms/PageContent"
import {getPageById} from "@/sanity/data/pages"

export const revalidate = 60

export default async function About() {
  const page = await getPageById("page-about")
  return <PageContent page={page} fallbackTitle="About" fallbackExcerpt="Soloist. Chamber Musician. Educator. Artistic Catalyst." fallbackContent={<AboutFallback />} />
}

function AboutFallback() {
  return <>
    <h2>Performer</h2>
    <p>Violinist Katie Lansdale is widely acclaimed as soloist, chamber musician, educator, and artistic catalyst. She has performed as soloist and chamber artist on three continents, recording solo and trio CDs for Centaur and Triton Records.</p>
    <p>Lansdale&apos;s concerto appearances have included the National Symphony, Cleveland Chamber Symphony, Austin Mozart Orchestra, Schroeder Classical Orchestra, NY Spectrum Orchestra, Baltimore Symphony, Piedmont Valley Orchestra, and New York Repertory Orchestra.</p>
    <h2>Chamber Musician</h2>
    <p>Winner of Grand Prizes at the Fischoff and Yellow Springs national chamber competitions, Lansdale has collaborated in chamber concerts with artists such as Yo Yo Ma, Donald Weilerstein, the Shanghai and Miami Quartets, and Charles Neidich.</p>
    <p>For over 35 years, Lansdale has been a member of the internationally acclaimed Lions Gate Trio, trio in residence at the University of Hartford.</p>
    <h2>Educator &amp; Artistic Leader</h2>
    <p>Lansdale has launched and led projects connecting her work as performer, educator, and artistic leader. She is the creator and director of the Solo Strings Workshop at Promisek and co-director of Ode to Joy, an annual chamber festival in Hartford, Connecticut.</p>
  </>
}
