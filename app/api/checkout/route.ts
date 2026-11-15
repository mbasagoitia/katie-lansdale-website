import Stripe from "stripe"
import {NextResponse} from "next/server"
import {getProductsByIds} from "@/sanity/data/products"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TEST_CUSTOMER_EMAIL = "marika.basagoitia@gmail.com"

type CheckoutPayload = {productIds?: unknown}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey?.startsWith("sk_test_")) return NextResponse.json({message: "Test checkout is not configured yet."}, {status: 503})

  const payload = await request.json().catch(() => null) as CheckoutPayload | null
  const productIds = uniqueProductIds(payload?.productIds)
  if (!productIds.length) return NextResponse.json({message: "Your cart is empty."}, {status: 400})

  const products = await getProductsByIds(productIds)
  if (products.length !== productIds.length) return NextResponse.json({message: "One or more cart items are no longer available. Please refresh your cart and try again."}, {status: 400})

  const origin = request.headers.get("origin")
  if (!origin || !isHttpUrl(origin)) return NextResponse.json({message: "We could not determine the checkout return address."}, {status: 400})

  const stripe = new Stripe(secretKey)
  const customerEmail = process.env.STRIPE_TEST_CUSTOMER_EMAIL || TEST_CUSTOMER_EMAIL
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customerEmail,
    payment_intent_data: {receipt_email: customerEmail},
    line_items: products.map((product) => ({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(product.price * 100),
        product_data: {name: product.title, description: product.shortDescription},
      },
    })),
    metadata: {product_ids: productIds.join(",")},
    success_url: `${origin}/watch-listen/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/watch-listen/checkout/cancel`,
  })

  if (!session.url) return NextResponse.json({message: "We could not create a checkout session. Please try again."}, {status: 502})
  return NextResponse.json({url: session.url})
}

function uniqueProductIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((id): id is string => typeof id === "string" && id.length > 0 && id.length < 128))].slice(0, 20)
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}
