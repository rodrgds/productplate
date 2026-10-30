# Polar Billing Option

Use this when the product should sell through Polar checkout sessions and later map orders, subscriptions, or benefits into app entitlements.

Install only if using the optional SDK (the default adapter uses native `fetch` with zero dependencies):

```sh
bun add @polar-sh/sdk
```

Environment:

```env
POLAR_ACCESS_TOKEN=
POLAR_SERVER=sandbox
POLAR_PRODUCT_PRO=
```

Activation checklist:

1. Copy `billing-adapter.ts.example` to `src/lib/server/billing/provider.ts`.
2. Keep `POLAR_ACCESS_TOKEN` server-side only.
3. Create checkout sessions from server routes or Convex actions, never from client components.
4. Store `external_customer_id` as the app user ID.
5. Add webhook handling before granting paid access.
6. Remove Autumn or other billing providers after Polar checkout and entitlement sync work.

Official docs checked while creating this scaffold:

- Polar API overview: https://polar.sh/docs/api-reference/introduction
- Polar create Checkout Session: https://polar.sh/docs/api-reference/checkouts/create-session
- Polar Customer Portal Sessions: https://polar.sh/docs/api-reference/customer-sessions/create
