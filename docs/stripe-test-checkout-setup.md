# Stripe test checkout setup

The Watch / Listen cart creates Stripe Checkout Sessions using test keys only. Add these server-only variables to `.env.local` and to the hosting environment:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_TEST_CUSTOMER_EMAIL=marika.basagoitia@gmail.com
```

Use a Stripe test-mode secret key. The checkout route rejects live keys (`sk_live_`) by design. Stripe Checkout prefills Marika’s email address and requests that its receipt be sent there. Complete test transactions with Stripe’s test card number `4242 4242 4242 4242`, any future expiration date, and any CVC.

Before accepting real payments, replace the test-only guard with a reviewed live-payment setup and add webhook-based fulfillment for digital downloads and physical-CD orders.
