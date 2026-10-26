import {createBiographyPdf} from "@/lib/press-kit-pdf"
import {pressKitLongBio, pressKitShortBioPlaceholder} from "@/sanity/content/pressKitSeed"
import {getPageById} from "@/sanity/data/pages"
import type {TypedObject} from "@portabletext/types"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(_request: Request, {params}: {params: Promise<{length: string}>}) {
  const {length} = await params
  if (length !== "short" && length !== "long") return new Response("Not found", {status: 404})

  const page = await getPageById("page-photos-press-kit")
  const isLongBio = length === "long"
  const paragraphs = isLongBio
    ? toParagraphs(page?.pressKitLongBio?.length ? page.pressKitLongBio : pressKitLongBio)
    : toParagraphs(page?.pressKitShortBio || pressKitShortBioPlaceholder)
  const title = isLongBio ? "Long bio" : "Short bio"
  const pdf = await createBiographyPdf({title, paragraphs})
  const body = new ArrayBuffer(pdf.byteLength)
  new Uint8Array(body).set(pdf)

  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="katie-lansdale-${length}-bio.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}

function toParagraphs(value: string | TypedObject[]) {
  if (typeof value === "string") return value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)

  return value.flatMap((block) => {
    if (block._type !== "block" || !("children" in block) || !Array.isArray(block.children)) return []
    const paragraph = block.children.flatMap((child) => typeof child === "object" && child && "text" in child && typeof child.text === "string" ? [child.text] : []).join("").trim()
    return paragraph ? [paragraph] : []
  })
}
