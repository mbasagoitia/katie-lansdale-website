import {aboutPageSeed} from "./aboutPageSeed.ts"

export type LocalImageSeed = {
  sourcePath: string
  alt: string
}

export type SitePageSeed = {
  id: string
  title: string
  excerpt?: string
  seoTitle?: string
  seoDescription?: string
  content?: unknown[]
  aboutIntroduction?: unknown[]
  heroImage?: LocalImageSeed
  gallery?: LocalImageSeed[]
  quotes?: Array<{_key: string; quote: string; attribution?: string}>
  featuredIn?: Array<{_key: string; name: string; image: LocalImageSeed; url?: string}>
  trioMembers?: Array<{_key: string; name: string; instrument: string}>
  trioStatement?: string
  trioQuote?: string
  trioQuoteAttribution?: string
  trioRecordings?: Array<{_key: string; title: string; subtitle?: string; coverArtUrl?: string; audioUrl?: string}>
  trioWebsiteUrl?: string
  projectCards?: Array<{_key: string; title: string; category?: string; description: string; imageUrl?: string; linkUrl?: string; linkLabel?: string}>
}

export const sitePageSeeds: SitePageSeed[] = [
  {
    id: "page-home",
    title: "Home",
    seoTitle: "Katie Lansdale | Violinist",
    seoDescription: "Discover violinist Katie Lansdale’s performances, recordings, teaching, and work with the Lions Gate Trio.",
    gallery: [
      {sourcePath: "public/images/headshots/headshot-1.jpg", alt: "Katie Lansdale playing violin"},
      {sourcePath: "public/images/headshots/headshot-2.JPG", alt: "Katie Lansdale with her violin"},
    ],
    quotes: [
      {_key: "american-record-guide", quote: "\"This is one of the best recordings of this music.\"", attribution: "American Record Guide on her Bach CD"},
      {_key: "berliner-morgenpost", quote: "“These three stunning musicians are wonderful soloists, and as a team, unbeatable. They communicate joy in music-making not only in technical brilliance but in an unbelievable playful lightness, and their joy is infectious…a wonderful addition to the international music scene.”", attribution: "Berliner Morgenpost on the Lions Gate Trio"},
      {_key: "berliner-morgenpost-soloist", quote: "A stunning musician and wonderful soloist, communicating an infectious joy …a wonderful addition to the international music scene.", attribution: "Berliner Morgenpost"},
      {_key: "cleveland-plain-dealer-brilliant", quote: "A truly brilliant performance.", attribution: "Cleveland Plain Dealer"},
      {_key: "boston-globe-first-class", quote: "A first class soloist.", attribution: "Boston Globe"},
      {_key: "cleveland-plain-dealer-bold", quote: "A bold and expressive soloist.", attribution: "Cleveland Plain Dealer"},
      {_key: "boston-globe-tanglewood", quote: "Katie Lansdale was a first class soloist.", attribution: "Boston Globe, review of the Tanglewood Festival of Contemporary Music"},
    ],
    featuredIn: [
      {_key: "strings-magazine", name: "Strings Magazine", image: {sourcePath: "public/images/logos/strings-logo-black.png", alt: "Strings Magazine"}},
      {_key: "american-string-teachers", name: "American String Teachers Association", image: {sourcePath: "public/images/logos/asta-logo-black.png", alt: "American String Teachers Association"}},
      {_key: "suzuki-association", name: "Suzuki Association of the Americas", image: {sourcePath: "public/images/logos/saa-logo-black.png", alt: "Suzuki Association of the Americas"}},
    ],
  },
  {
    id: "page-about",
    title: aboutPageSeed.title,
    excerpt: aboutPageSeed.excerpt,
    seoTitle: "About Katie Lansdale | Violinist",
    seoDescription: "Learn about violinist Katie Lansdale’s work as a soloist, chamber musician, educator, and artistic leader.",
    aboutIntroduction: aboutPageSeed.introduction,
    content: aboutPageSeed.content,
    heroImage: {sourcePath: "public/images/headshots/headshot-3.jpg", alt: "Katie Lansdale"},
  },
  {
    id: "page-contact",
    title: "Contact",
    excerpt: "Use the contact form below to get in touch.",
    seoTitle: "Contact Katie Lansdale | Violinist",
    seoDescription: "Contact violinist Katie Lansdale for concert engagements, collaborations, teaching, and general inquiries.",
  },
  {
    id: "page-watch-listen",
    title: "Watch / Listen",
    excerpt: "Listen to recordings and discover music available from Katie Lansdale.",
    seoTitle: "Watch & Listen | Katie Lansdale",
    seoDescription: "Listen to recordings and explore music by violinist Katie Lansdale, including available albums and individual tracks.",
  },
  {
    id: "page-lions-gate-trio",
    title: "Lions Gate Trio",
    excerpt: "A long-standing musical partnership shaped by curiosity, generosity, and the joy of chamber music.",
    seoTitle: "Lions Gate Trio | Katie Lansdale",
    seoDescription: "Explore violinist Katie Lansdale’s work with the Lions Gate Trio, including recordings, performances, and news.",
    heroImage: {sourcePath: "public/images/lions-gate-trio.webp", alt: "The Lions Gate Trio"},
    trioMembers: [
      {_key: "katie", name: "Katie Lansdale", instrument: "Violin"},
      {_key: "darrett", name: "Darrett Adkins", instrument: "Cello"},
      {_key: "florence", name: "Florence Millet", instrument: "Piano"},
    ],
    trioStatement: "For over 35 years, Katie Lansdale has performed with the internationally acclaimed Lions Gate Trio. Together with cellist Darrett Adkins and pianist Florence Millet, she brings the piano-trio repertoire to life through performances, recordings, residencies, and educational work in the United States and Europe.",
    trioRecordings: [
      {_key: "ravel-finale", title: "Piano Trio in A minor — IV. Finale: Animé", subtitle: "Maurice Ravel · Ravel, Ives & Clarke: Piano Trios", coverArtUrl: "https://images.squarespace-cdn.com/content/v1/5a6cacc2cf81e018e2e33569/1785280687262-S648O08QEVEHDEX4FZ1Q/Ravel_Ives_Clarke.jpg", audioUrl: "https://static1.squarespace.com/static/5a6cacc2cf81e018e2e33569/t/5a84b1aa8165f5ac7e90a42a/1785181515342/04+IV.+Finale_+Anime.m4a"},
      {_key: "theater-of-the-ear", title: "Theater of the Ear — III. On That Day", subtitle: "Tamar Diesendruck · Theater of the Ear", coverArtUrl: "https://images.squarespace-cdn.com/content/v1/5a6cacc2cf81e018e2e33569/1517688123612-UTR5O3AJ8EKWG4X0264H/Theater_of_the_Ear.jpg", audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/Music/a7/d4/4d/mzm.pfbzifep.aac.p.m4a"},
      {_key: "schumann-mit-innigem-ausdruck", title: "Piano Trio No. 2 — II. Mit innigem Ausdruck", subtitle: "Robert Schumann · Complete Music of Robert Schumann", coverArtUrl: "https://images.squarespace-cdn.com/content/v1/5a6cacc2cf81e018e2e33569/1517078901961-S48A1QYF5LL5J38PXMHO/Schumann.jpeg", audioUrl: "https://static1.squarespace.com/static/5a6cacc2cf81e018e2e33569/t/5a84afefe4966b15dd8961a7/1785181515368/1-10+Piano+Trio+No.+2+in+F+major%2C+Op.+80+-+II.+Mit+innigem+Ausdruck.m4a"},
    ],
    trioWebsiteUrl: "https://lionsgatetrio.org/",
  },
  ...[
    ["page-media", "Media", "Explore recordings, performances, and video from violinist Katie Lansdale.", "Media | Katie Lansdale", "Explore recordings, performances, and video from violinist Katie Lansdale."],
    ["page-photos-press-kit", "Photos & Press Kit", "Download approved photos and press materials for Katie Lansdale.", "Photos & Press Kit | Katie Lansdale", "Download official photos and press materials for violinist Katie Lansdale."],
    ["page-reviews", "Reviews", "Read critical acclaim and audience responses to Katie Lansdale’s performances and recordings.", "Reviews | Katie Lansdale", "Read reviews and critical acclaim for violinist Katie Lansdale’s performances and recordings."],
    ["page-publications", "Publications", "Explore publications, editions, and written resources by and featuring Katie Lansdale.", "Publications | Katie Lansdale", "Explore publications, editions, and written resources by and featuring violinist Katie Lansdale."],
    ["page-news-and-events", "News & Events", "Stay up to date with Katie Lansdale’s upcoming performances, projects, and announcements.", "News & Events | Katie Lansdale", "Find upcoming performances, projects, and announcements from violinist Katie Lansdale."],
    ["page-projects-and-affiliations", "Projects & Affiliations", "Discover Katie Lansdale’s collaborative projects, educational initiatives, and artistic affiliations.", "Projects & Affiliations | Katie Lansdale", "Discover violinist Katie Lansdale’s collaborative projects, educational initiatives, and artistic affiliations."],
    ["page-donations", "Donations", "Support Katie Lansdale’s artistic, educational, and community music-making projects.", "Support Katie Lansdale | Donations", "Support violinist Katie Lansdale’s artistic, educational, and community music-making projects."],
  ].map(([id, title, excerpt, seoTitle, seoDescription]) => ({
    id,
    title,
    excerpt,
    seoTitle,
    seoDescription,
    ...(id === "page-projects-and-affiliations" ? {
      projectCards: [
        {
          _key: "lions-gate-trio",
          title: "Lions Gate Trio",
          category: "Ensemble",
          description: "With cellist Darrett Adkins and pianist Florence Millet, Katie Lansdale performs, records, and teaches as a member of this internationally acclaimed piano trio.",
          imageUrl: "/images/lions-gate-trio.webp",
          linkUrl: "https://lionsgatetrio.org/",
          linkLabel: "Visit Lions Gate Trio",
        },
        {
          _key: "promisek-solo-strings-workshops",
          title: "Promisek Solo Strings Workshops",
          category: "Education",
          description: "Katie leads Promisek's annual Solo Strings Workshops, a focused celebration of solo-string repertoire—from Bach and Telemann to Paganini and music of today.",
          imageUrl: "https://i0.wp.com/promisek.org/wp-content/uploads/2017/02/promisek-concerts-lg.jpg?fit=2000%2C1200&ssl=1",
          linkUrl: "https://promisek.org/concert/workshops/",
          linkLabel: "Explore the workshops",
        },
        {
          _key: "ode-to-joy-festival",
          title: "Ode to Joy Festival",
          category: "Festival",
          description: "Katie co-directs Hartt's annual chamber festival. The 2026 Nights in Vienna program brings the Lions Gate Trio together with Hartt students, faculty, alumni, and guest artists.",
          imageUrl: "https://www.hartford.edu/unotes/_images/submitted_images/Ode%20to%20Joy%20festial_1788274380_file1.png",
          linkUrl: "https://www.hartford.edu/unotes/2026/09/ode-to-joy-festival-fall-2026.aspx",
          linkLabel: "Read about the festival",
        },
      ],
    } : {}),
  })),
]
