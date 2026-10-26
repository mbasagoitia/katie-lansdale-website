import PDFDocument from "pdfkit"
import {join} from "node:path"
import {PassThrough} from "node:stream"

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const LEFT_MARGIN = 58
const RIGHT_MARGIN = 58
const TOP_RULE_HEIGHT = 8
const BODY_BOTTOM = 72
const CONTENT_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN
const fontDirectory = join(process.cwd(), "public", "fonts")
const cormorantFont = join(fontDirectory, "CormorantGaramond-Variable.ttf")
const interFont = join(fontDirectory, "Inter-Variable.ttf")

type PdfInput = {
  title: string
  paragraphs: string[]
}

export async function createBiographyPdf({title, paragraphs}: PdfInput): Promise<Uint8Array> {
  const document = new PDFDocument({
    autoFirstPage: true,
    bufferPages: true,
    margin: 0,
    size: [PAGE_WIDTH, PAGE_HEIGHT],
    info: {Author: "Katie Lansdale", Title: title},
  })
  const stream = new PassThrough()
  const chunks: Buffer[] = []
  stream.on("data", (chunk: Buffer) => chunks.push(chunk))
  document.pipe(stream)

  document.registerFont("Cormorant", cormorantFont)
  document.registerFont("Inter", interFont)

  drawPageHeader(document, title)
  for (const paragraph of paragraphs) {
    const text = normalizeText(paragraph)
    const height = document.heightOfString(text, bodyTextOptions())
    if (document.y + height > PAGE_HEIGHT - BODY_BOTTOM) {
      document.addPage()
      drawPageHeader(document, title)
    }
    document.font("Inter").fontSize(10.6).fillColor("#5c3a21").text(text, LEFT_MARGIN, document.y, bodyTextOptions())
    document.moveDown(1.25)
  }

  const pageRange = document.bufferedPageRange()
  for (let pageIndex = 0; pageIndex < pageRange.count; pageIndex += 1) {
    document.switchToPage(pageIndex)
    document.font("Inter").fontSize(8).fillColor("#8e5d38")
    document.text("www.katielansdaleviolin.com", LEFT_MARGIN, PAGE_HEIGHT - 42, {width: CONTENT_WIDTH / 2})
    document.text(`${pageIndex + 1} / ${pageRange.count}`, LEFT_MARGIN + CONTENT_WIDTH / 2, PAGE_HEIGHT - 42, {align: "right", width: CONTENT_WIDTH / 2})
  }

  const finished = new Promise<Uint8Array>((resolve, reject) => {
    stream.on("end", () => resolve(new Uint8Array(Buffer.concat(chunks))))
    stream.on("error", reject)
    document.on("error", reject)
  })
  document.end()
  return finished
}

function drawPageHeader(document: PDFKit.PDFDocument, title: string) {
  document.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill("#fffaf4")
  document.rect(0, 0, PAGE_WIDTH, TOP_RULE_HEIGHT).fill("#a86c34")

  document.font("Cormorant").fontSize(30).fillColor("#7b583d").text("Katie Lansdale", LEFT_MARGIN, 58, {width: CONTENT_WIDTH})
  document.font("Cormorant").fontSize(18).fillColor("#8e5d38").text(title, LEFT_MARGIN, 98, {width: CONTENT_WIDTH})
  document.font("Inter").fontSize(8.5).fillColor("#a86c34").text("www.katielansdaleviolin.com", LEFT_MARGIN, 129, {width: CONTENT_WIDTH})
  document.moveTo(LEFT_MARGIN, 153).lineTo(PAGE_WIDTH - RIGHT_MARGIN, 153).lineWidth(0.7).strokeColor("#dfcdbc").stroke()
  document.y = 180
}

function bodyTextOptions() {
  return {width: CONTENT_WIDTH, lineGap: 4, paragraphGap: 0}
}

function normalizeText(value: string) {
  return value
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00A0/g, " ")
}
