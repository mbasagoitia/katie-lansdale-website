# Site page content migration

## Scope

This is a one-time migration from the repository’s current page fallbacks to the 12 fixed Sanity singleton page documents. The source is the local Next.js code and public image assets; all content is English and there are no redirects, locales, archived records, or relationship documents in scope.

## Field mapping

| Existing page content | Sanity destination |
| --- | --- |
| Homepage gallery, quotes, and publication logos | `page-home` fields |
| `headshot-3.jpg` | `heroImage`, with alt text |
| “About” | `title` |
| Artist tagline | `excerpt` |
| Opening biography paragraph | `aboutIntroduction` (Portable Text) |
| Performer, Chamber Musician, Educator & Artistic Leader, and Education & Teaching sections | `content` (Portable Text with Heading 2 blocks) |
| Contact and Watch / Listen headings | Their fixed page documents |
| Lions Gate Trio hero, members, description, quote, recordings, and official-site link | `page-lions-gate-trio` fields |
| Page titles that currently only have a “being prepared” fallback | Fixed page title and excerpt |

## Load and validation

Run `npm run migrate:site-pages` once after adding `SANITY_API_WRITE_TOKEN` (Editor access) to `.env.local`. The script uploads seven local image assets before it creates the page documents. It skips documents already containing editorial content, so it is safe to rerun. Use `npm run migrate:site-pages -- --dry-run` to inspect the scope and `--overwrite` only when intentionally replacing CMS edits with the repository fallback.

After the migration, run `npm run validate:site-pages` to confirm every document, expected content field, and image reference. Then confirm all 12 page documents appear under **Edit site → Website Pages**. Spot-check Home, About, Contact, Watch / Listen, and Lions Gate Trio; publish each document when the editor is satisfied with it. Dynamic Lions Gate calendar and news data intentionally remains live from the official site, while its CMS override fields remain available for editorial changes.
