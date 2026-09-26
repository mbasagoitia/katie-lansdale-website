import {NextResponse} from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TEST_RECIPIENT = "marika.basagoitia@gmail.com"

type ContactPayload = {
  name?: unknown
  email?: unknown
  subject?: unknown
  message?: unknown
  company?: unknown
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as ContactPayload | null
  const name = text(payload?.name, 120)
  const email = text(payload?.email, 254)
  const subject = text(payload?.subject, 180)
  const message = text(payload?.message, 5000)
  const company = text(payload?.company, 120)

  if (company) return NextResponse.json({ok: true})
  if (!name || !email || !message || !isEmail(email)) return NextResponse.json({message: "Please provide your name, a valid email address, and a message."}, {status: 400})

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL
  if (!apiKey || !from) return NextResponse.json({message: "Contact delivery is not configured yet. Please try again soon."}, {status: 503})

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json"},
    body: JSON.stringify({
      from,
      to: [process.env.CONTACT_RECIPIENT_EMAIL || TEST_RECIPIENT],
      reply_to: email,
      subject: subject ? `Katie Lansdale website: ${subject}` : "Katie Lansdale website contact form",
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    }),
  })

  if (!response.ok) return NextResponse.json({message: "We could not send your message. Please try again later."}, {status: 502})
  return NextResponse.json({ok: true})
}

function text(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : ""
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
