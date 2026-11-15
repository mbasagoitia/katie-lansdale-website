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
  return `Thank you for your purchase. Your download links are available for seven days:\n\n${downloads.map((download) => `${download.productTitle} — ${download.recordingTitle}\n${download.url}`).join("\n\n")}\n\nKatie Lansdale`
}

function htmlBody(downloads: DigitalDownload[]) {
  const links = downloads.map((download) => `<li><strong>${escapeHtml(download.productTitle)}</strong> — ${escapeHtml(download.recordingTitle)}<br><a href="${escapeAttribute(download.url)}">Download</a></li>`).join("")
  return `<p>Thank you for your purchase. Your download links are available for seven days:</p><ul>${links}</ul><p>Katie Lansdale</p>`
}

function escapeHtml(value: string) {
  return value.replace(/[&<>\"]/g, (character) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"})[character] || character)
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/'/g, "&#39;")
}
