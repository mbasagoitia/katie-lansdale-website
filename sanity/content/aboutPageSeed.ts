import type {TypedObject} from "@portabletext/types"

type PortableTextBlock = TypedObject & {
  _key: string
  _type: "block"
  children: Array<{_key: string; _type: "span"; marks: string[]; text: string}>
  markDefs: unknown[]
  style: "normal" | "h2"
}

function block(key: string, text: string, style: "normal" | "h2" = "normal"): PortableTextBlock {
  return {
    _key: key,
    _type: "block",
    children: [{_key: `${key}-text`, _type: "span", marks: [], text}],
    markDefs: [],
    style,
  }
}

export const aboutPageSeed = {
  title: "About",
  excerpt: "Soloist. Chamber Musician. Educator. Artistic Catalyst.",
  introduction: [block("about-introduction", "Violinist Katie Lansdale is widely acclaimed as soloist, chamber musician, educator, and artistic catalyst. She has performed as soloist and chamber artist on three continents, recording solo and trio CDs for Centaur and Triton Records.")],
  content: [
    block("performer-heading", "Performer", "h2"),
    block("performer-1", "Lansdale's concerto appearances have included with the National Symphony, the Cleveland Chamber Symphony, the Austin Mozart Orchestra, the Schroeder Classical Orchestra, the NY Spectrum Orchestra, the Baltimore Symphony, the Piedmont Valley Orchestra, and the New York Repertory Orchestra. Lansdale performs on renowned concert series, including at the Phillips Collection, the Caramoor Series, Carnegie Hall's Weill Hall and Lincoln Center's Rose Room."),
    block("performer-2", "Particularly widely acclaimed for performances of solo Bach, Lansdale has performed the complete cycle over a dozen times in North and South America. “This is one of the best recordings of this music,” wrote the American Record Guide of her Bach CD."),
    block("performer-3", "Following her earlier presentation on solo Bach at Juilliard's Delay Symposium, Lansdale was recently invited to return in 2026 to share another passion of hers---violin works by composers from around the world. A passionate advocate for new and undiscovered music, Lansdale has performed premieres and unjustly forgotten works throughout the Eastern seabord. She was invited to present works by composers from under-represented groups at Juilliard's 2026 Delay Symposium. Lansdale is also honored to frequently perform music frequently by today's leading compositional voices, including commissioned works by Jerod Impachchaahaaha' Tate and Evan Williams."),
    block("chamber-heading", "Chamber Musician", "h2"),
    block("chamber-1", "Winner of Grand Prizes at the Fischoff and Yellow Springs national chamber competitions, Lansdale has collaborated in chamber concerts with artists such as Yo Yo Ma, Donald Weilerstein, the Shanghai and Miami Quartets, and Charles Neidich."),
    block("chamber-2", "For over 35 years Lansdale has been a member of the internationally-acclaimed Lions Gate Trio, trio in residence at the University of Hartford, recording for Centaur and Triton records and performing across Europe and the Eastern US."),
    block("chamber-3", "In New York, where she founded the acclaimed Locrian new music group, Lansdale's extensive chamber music concerts have ranged from Mostly Mozart at Lincoln Center with Yo Yo Ma to Merkin Hall with the Twentieth Centuryists. With the Festival Chamber Society, she performed regularly for a decade in Carnegie Hall's Weill Hall."),
    block("leader-heading", "Educator & Artistic Leader", "h2"),
    block("leader-1", "Lansdale has launched and led a number of projects that connect her work as performer, educator and artistic leader. In addition to founding the Lions Gate Trio, Lansdale is the creator and director of the Solo Strings Workshop at Promisek. She is also co-director of Ode to Joy, an extensive annual chamber festival in Hartford, CT. A champion of musical connections to children and communities, Lansdale reguarly joins her students in community engagement campaigns called Music for 1000 Children."),
    block("education-heading", "Education & Teaching", "h2"),
    block("education-1", "A native of Washington D.C., Lansdale studied with Ronda Cole, Josef Gingold, Felix Galimir, Donald Weilerstein and Mitchell Stern. She graduated cum laude from Yale, where she was awarded prizes in both the arts and humanities, and earned graduate music degrees (M.M., D.M.A.) at the Cleveland Institute of Music and Manhattan School of Music."),
    block("education-2", "She has performed at numerous summer festival faculties, including Kneisel Hall Chamber Festival, the Amalfi Coast Chamber Festival (Italy), the Kuhmo Festival (Finland), Aria International Music Festival, and Music from Salem. Having taught at Boston University and at State University of New York-Stony Brook, Lansdale now serves on the faculty of the Hartt School at the University of Hartford and Boston Conservatory at Berklee."),
  ],
}
