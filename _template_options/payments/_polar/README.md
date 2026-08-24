# Polar Billing Option

Use this when the product should sell through Polar checkout sessions and later map orders, subscriptions, or benefits into app entitlements.

## Installation

Install only if selected:

```sh
bun add @polar-sh/sdk
```

## Environment Variables

Server-side only (`.env` / server runtime):

```env
POLAR_ACCESS_TOKEN=polar_at_...
POLAR_SERVER=sandbox # 'sandbox' | 'production'
POLAR_PRODUCT_PRO=prod_...
```

## When to Choose Polar vs Autumn / Stripe Direct

- **Choose Polar** when you want an open-source Merchant of Record (MoR) / developer-centric monetization platform that handles EU VAT / global sales tax, built-in customer portals, and automatic benefits distribution (e.g. GitHub repository access, Discord role grants, file downloads, license keys).
- **Choose Autumn** when you want lightweight usage-based metering tightly integrated with Convex and direct Stripe accounts.
- **Choose Stripe Direct** when you have custom Stripe Elements requirements, specific marketplace payout flows, or existing Stripe Connect infrastructure.

## Customer Portal & Benefits Access

- **Customer Portal**: Polar provides a hosted customer portal out of the box. Use `createCustomerPortalSession` to generate a direct management URL for customers to manage subscriptions, update payment methods, and download invoices.
- **Entitlements & Benefits**: Polar supports automated benefit grants (GitHub repository invites, Discord roles, digital file downloads). Entitlements can be queried via Polar API or synced via `order.created` / `subscription.active` webhooks.

## Activation Checklist

1. Copy `billing-adapter.ts.example` to `src/lib/server/billing/provider.ts`.
2. Keep `POLAR_ACCESS_TOKEN` server-side only.
3. Create checkout sessions and customer portal sessions from server routes or Convex actions, never from client components.
4. Store `external_customer_id` as the app user ID.
5. Add webhook handling (`/api/webhooks/polar`) before granting paid access.
6. Remove Autumn or other billing providers after Polar checkout and entitlement sync work.

## References

- Polar API Overview: https://polar.sh/docs/api-reference/introduction
- Polar Create Checkout Session: https://polar.sh/docs/api-reference/checkouts/create-session
- Polar Customer Portal: https://polar.sh/docs/api-reference/customer-portal
- Polar Webhooks: https://polar.sh/docs/api-reference/webhooks
