import type { Metadata } from "next";
import { sitePageSeeds } from "@/sanity/content/sitePageSeeds";
import { getPageById, getPageMetadata } from "@/sanity/data/pages";
import type { ProjectCard } from "@/types/page";
import ProjectFeature from "@/components/projects/ProjectFeature";
import styles from "./page.module.css";

export const revalidate = 60;

const pageId = "page-projects-and-affiliations";
const seed = sitePageSeeds.find((page) => page.id === pageId);
const fallbackCards = (seed?.projectCards || []) as ProjectCard[];

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata(pageId);
}
export default async function ProjectsAndAffiliationsPage() {
  const page = await getPageById(pageId);
  const cards = page?.projectCards?.length ? page.projectCards : fallbackCards;

  return (
    <main className={styles.page} data-quiet-background>
      <header className={styles.header}>
        <h1>{page?.title || "Projects & Affiliations"}</h1>
      </header>

      <section className={styles.grid} aria-label="Projects and affiliations">
        {cards.map((card) => (
          <ProjectFeature key={card._key} card={card} />
        ))}
      </section>
    </main>
  );
}
