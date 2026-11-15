import "server-only"

import type {DigitalDownload} from "@/lib/purchases/digital-downloads"

const TEST_RECIPIENT = "marika.basagoitia@gmail.com"

export async function sendDownloadEmail({to, downloads}: {to?: string | null; downloads: DigitalDownload[]}) {
  if (!downloads.length) return {sent: false, reason: "no-downloads" as const}

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.ORDER_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL
  if (!apiKey || !from) throw new Error("Download email delivery is not configured.")

  const recipient = process.env.STRIPE_TEST_CUSTOMER_EMAIL || to || TEST_RECIPIENT
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json"},
    body: JSON.stringify({
      from,
      to: [recipient],
      subject: "Your Katie Lansdale digital download",
      text: textBody(downloads),
      html: htmlBody(downloads),
    }),
  })
  if (!response.ok) throw new Error("Download email could not be sent.")
  return {sent: true as const}
}

function textBody(downloads: DigitalDownload[]) {
  return `Thank you for your purchase. Your download links are available for seven days:\n\n${downloads.map((download) => `${download.productTitle}\n${download.recordings.map((recording) => `${recording.title}\n${recording.url}`).join("\n\n")}`).join("\n\n")}\n\nKatie Lansdale`
}

function htmlBody(downloads: DigitalDownload[]) {
  const groups = downloads.map((download) => `<h2>${escapeHtml(download.productTitle)}</h2><ul>${download.recordings.map((recording) => `<li><strong>${escapeHtml(recording.title)}</strong><br><a href="${escapeAttribute(recording.url)}">Download</a></li>`).join("")}</ul>`).join("")
  return `<p>Thank you for your purchase. Your download links are available for seven days:</p>${groups}<p>Katie Lansdale</p>`
}

function escapeHtml(value: string) {
  return value.replace(/[&<>\"]/g, (character) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"})[character] || character)
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/'/g, "&#39;")
}
