import styles from "./page.module.css";
import PhotoSlider from "@/components/home/PhotoSlider/PhotoSlider";
import QuoteSlider from "@/components/home/quote-slider/quote-slider";
import FeaturedInBar from "@/components/home/FeaturedInBar/FeaturedInBar";

export default function Home() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.portraitWrapper}>
          <PhotoSlider />
        </div>
        <div className={styles.quoteWrapper}>
          <QuoteSlider />
          <FeaturedInBar />
        </div>
      </section>
    </>
  );
}

// Todo:

// Rethinking the entire "Add Music" process

// I think three options: Remove the album button entirely. Just have a single button...."Add music"
// 1. This is a single movement work (ask if this is a new recording of an existing work (if yes, search for the work); associate composer and work; add recording info)
// 2. This is a multi-movement work that is not part of an album (ask if this is a new recording of an existing work; add new work if needed (very likely needed); render "add movements"; doing this will modify both work and recording under the hood)
// 3. I am creating an album and want to add music to it (now add a combination of single and/or multi-movement works and their associated recording info)

// Don't have a separate create product button. Just at the end of adding new music, ask if it's for sale. If so, open the product interface. If not, save for later and have the option to add it as a product at a later time.

// It is very important that we specifically ask the question "is this a new recording of an existing work?"
// If no, then render all the info needed for registering a new work; if yes, search through a list of existing works

// For composer, have either a search bar or if "add new composer" is triggered, open the interface to register a new composer and all associated data
// Remove the text "add a recording and associate it with a musical work" it is confusing

// Test out adding music through Sanity

// Think about what actually needs to be exposed (remove product etc. on the left side?)

// Create singleton pages so she can edit her content
