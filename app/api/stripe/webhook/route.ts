import Stripe from "stripe"
import {NextResponse} from "next/server"
import {sendDownloadEmail} from "@/lib/purchases/download-email"
import {createDigitalDownloads} from "@/lib/purchases/digital-downloads"
import {getProductsByIdsForDelivery} from "@/sanity/data/products"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get("stripe-signature")
  if (!secretKey?.startsWith("sk_test_") || !webhookSecret?.startsWith("whsec_") || !signature) {
    return NextResponse.json({message: "Test download delivery is not configured."}, {status: 503})
  }

  let event: Stripe.Event
  try {
    event = new Stripe(secretKey).webhooks.constructEvent(await request.text(), signature, webhookSecret)
  } catch {
    return NextResponse.json({message: "Invalid Stripe webhook signature."}, {status: 400})
  }

  if (event.livemode || !isPaidCheckoutEvent(event)) return NextResponse.json({received: true})
  const session = event.data.object
  const metadata = session.metadata || {}
  if (session.payment_status !== "paid" || metadata.download_email_event_id) return NextResponse.json({received: true})

  const productIds = parseProductIds(metadata.product_ids)
  const products = await getProductsByIdsForDelivery(productIds)
  const downloads = await createDigitalDownloads(products)
  await sendDownloadEmail({to: session.customer_details?.email || session.customer_email, downloads})

  await new Stripe(secretKey).checkout.sessions.update(session.id, {
    metadata: {...metadata, download_email_event_id: event.id},
  })
  return NextResponse.json({received: true})
}

function isPaidCheckoutEvent(event: Stripe.Event): event is Stripe.Event & {data: {object: Stripe.Checkout.Session}} {
  return event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded"
}

function parseProductIds(value?: string): string[] {
  return [...new Set((value || "").split(",").filter((id) => id.length > 0 && id.length < 128))].slice(0, 20)
}
