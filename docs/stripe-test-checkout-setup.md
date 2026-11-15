# Stripe test checkout setup

The Watch / Listen cart creates Stripe Checkout Sessions using test keys only. Add these server-only variables to `.env.local` and to the hosting environment:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_TEST_CUSTOMER_EMAIL=marika.basagoitia@gmail.com
STRIPE_WEBHOOK_SECRET=whsec_...
# Optional. Falls back to CONTACT_FROM_EMAIL when omitted.
ORDER_FROM_EMAIL="Katie Lansdale Website <onboarding@resend.dev>"
```

Use a Stripe test-mode secret key. The checkout route rejects live keys (`sk_live_`) by design. Stripe Checkout prefills Marika’s email address and requests that its receipt be sent there. Complete test transactions with Stripe’s test card number `4242 4242 4242 4242`, any future expiration date, and any CVC.

## Digital-download delivery

The site verifies a successful payment via Stripe webhook events, then sends a Resend email to Marika containing secure, one-time-style Supabase links for each digital recording purchased. Links expire after seven days. Physical-CD-only products do not include a download link.

In Stripe **test mode**, add an endpoint at `https://YOUR-DOMAIN/api/stripe/webhook`, subscribe it to `checkout.session.completed` and `checkout.session.async_payment_succeeded`, and copy its signing secret into `STRIPE_WEBHOOK_SECRET`. The webhook endpoint must be configured in the same hosting environment as the test key and Resend credentials.

The `receipt_email` passed to Stripe marks the address for a receipt but does not itself guarantee a message; turn on **Customer emails → Successful payments** in the Stripe Dashboard if you also want Stripe-branded receipts. The download email is sent independently through Resend.

Before accepting real payments, replace the test-only guards with a reviewed live-payment setup and use a durable fulfillment record for production-scale retry and duplicate protection.
