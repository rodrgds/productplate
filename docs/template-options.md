# Template Options

Product Plate uses a selection model, not a runtime toggle model.

- The active default is Convex, Better Auth, and Autumn.
- Alternate payment and database examples live in `_template_options`.
- The kickstart agent chooses one stack, activates the relevant files, and deletes the rest.
- Do not ship imports from `_template_options`.

## Why Not Runtime Toggles?

- Most apps need one billing provider and one data layer.
- Runtime toggles keep unused secrets, unused packages, and unused failure modes in the app.
- Agents can customize faster when inactive choices are explicit scaffolds instead of half-active abstractions.

Build runtime provider abstraction only when the product truly sells through multiple providers at the same time.

## Current Choices

| Area     | Default                       | Alternatives                                                       |
| -------- | ----------------------------- | ------------------------------------------------------------------ |
| Data     | Convex                        | Drizzle with PostgreSQL, SQLite, Turso, D1, or a custom SQL driver |
| Auth     | Better Auth                   | OAuth-only, email/password-only, or no-auth prototype              |
| Billing  | Autumn                        | Stripe direct, Polar, Creem, none                                  |
| AI       | AI SDK route and assistant UI | Keep backend only or remove                                        |
| Teams    | Organizations and invites     | Single-user profile/settings only                                  |
| Platform | API keys and webhooks         | API keys only or no developer surface                              |
| Demo     | `/auth/demo` disposable demo  | Delete during kickstart or replace with a product-specific demo    |

## Current Starter Surfaces

- Authenticated app: dashboard, billing, workspace, developer, assistant, editor, flow, map, Threlte, settings, admin users, admin organizations.
- Public site: landing, docs, blog, changelog, legal templates, component gallery, theme builder, auth screens, disposable demo.
- Backend: Convex auth, billing, organizations, entitlements, notifications, storage, API keys, webhooks, maintenance jobs, and the template-event HTTP endpoint.

The kickstart agent should keep only the surfaces that support the selected product loop. Everything else should be deleted or documented as source material.

## Kickstart Flow

1. Run the prompt in `START_HERE.md`.
2. Answer product basics first.
3. Let the agent recommend what to keep and remove.
4. Pick the active stack.
5. Let the agent rename the product, remove the demo account, activate the selected scaffold, rewrite or delete unused route surfaces, delete unused folders, and update docs/env examples.
6. Verify with `bun run lint`, `bun run check`, focused tests, and `bun run build`.

## Provider Notes

- Autumn is already active through Convex and should stay if you want the fastest Stripe-backed path.
- Stripe direct gives maximum control, but requires careful webhook and subscription handling.
- Polar is a good fit when checkout sessions, benefits, and customer portal flows map to the product.
- Creem is a good fit when checkout sessions, signed webhooks, test mode, and software sales workflows are important.
- Drizzle is a good fit when SQL is the source of truth or the team already owns database infrastructure.
