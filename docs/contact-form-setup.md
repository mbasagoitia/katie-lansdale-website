# Contact form email setup

The contact form sends messages through [Resend](https://resend.com/). Add these server-only values to `.env.local` for local testing and to the production hosting environment before publishing:

```bash
RESEND_API_KEY=re_...
CONTACT_FROM_EMAIL="Katie Lansdale Website <contact@your-verified-domain.com>"
CONTACT_RECIPIENT_EMAIL=marika.basagoitia@gmail.com
```

`CONTACT_RECIPIENT_EMAIL` defaults to `marika.basagoitia@gmail.com` while testing. The `CONTACT_FROM_EMAIL` domain must be verified in Resend. Do not use `NEXT_PUBLIC_` for any of these values.
