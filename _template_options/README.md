# Template Options

These files are inactive scaffolds for the kickstart agent. They keep optional providers and sections available without shipping them in the active app.

Rules:

- Do not import from `_template_options` in production code.
- Copy the selected option into the active app, then rename `.example` files to real extensions.
- Delete unselected folders after kickstart.
- Keep exactly one active billing provider unless the product truly needs runtime multi-provider support.
- Keep exactly one active data layer unless the product needs a deliberate migration bridge.

## Active Defaults

- Backend/data: Convex in `src/convex`.
- Auth: Better Auth.
- Billing: Autumn, backed by Stripe, in `src/convex/autumn.ts` and `src/convex/billing.ts`.
- Public preview: `/auth/demo`, disposable demo account.

## Available Scaffolds

| Area      | Option        | Folder             | Use When                                                             |
| --------- | ------------- | ------------------ | -------------------------------------------------------------------- |
| Billing   | Autumn        | `payments/_autumn` | You want the current Convex and Autumn path.                         |
| Billing   | Stripe direct | `payments/_stripe` | You need direct Stripe Checkout and webhook control.                 |
| Billing   | Polar         | `payments/_polar`  | You want Polar checkout sessions and entitlement workflows.          |
| Billing   | Creem         | `payments/_creem`  | You want Creem checkout, MoR-style operations, or license workflows. |
| Data      | Convex        | `data/_convex`     | You want the current realtime backend.                               |
| Data      | Drizzle       | `data/_drizzle`    | You want SQL with PostgreSQL, SQLite, Turso, D1, or another driver.  |
| Marketing | Mist          | `marketing/mist`   | You want to adapt one of the inactive marketing sections.            |

## Suggested Active Locations

- Billing provider contract: `src/lib/server/billing/provider.ts`
- Billing API routes: `src/routes/api/billing/...`
- SQL database client: `src/lib/server/db/index.ts`
- SQL schema: `src/lib/server/db/schema.ts`
- Convex backend: `src/convex`
- Marketing sections: `src/lib/components/landing/`

The kickstart agent should adapt these paths to the final stack and update README.md, PRODUCT.md, AGENTS.md, and env examples at the same time.
