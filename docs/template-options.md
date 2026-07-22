# Template Options

Product Plate uses a selection model, not a runtime toggle model.

- The founder default is `bun create product-plate` with one fixed profile: `prelaunch`, `solo-saas`, `team-saas`, or `ai-saas`.
- The active default is Convex, Better Auth, and Autumn.
- Alternate payment and database examples remain full-demo reference material in `_template_options`; generated apps never contain them.
- Direct full-demo forks may use the long kickstart prompt to choose a different stack.
- Do not ship imports from `_template_options`.

## Why Not Runtime Toggles?

- Most apps need one billing provider and one data layer.
- Runtime toggles keep unused secrets, unused packages, and unused failure modes in the app.
- Agents can customize explicit inactive scaffolds faster than partly active abstractions.

Build runtime provider abstraction only when the product truly sells through multiple providers at the same time.

## Current Choices

| Area     | Default                       | Alternatives                                                       |
| -------- | ----------------------------- | ------------------------------------------------------------------ |
| Data     | Convex                        | Drizzle with PostgreSQL, SQLite, Turso, D1, or a custom SQL driver |
| Auth     | Better Auth                   | OAuth-only, email/password-only, or no-auth prototype              |
| Billing  | Autumn                        | Stripe direct, Polar, Creem, none                                  |
| AI       | AI SDK route and assistant UI | Keep backend only or remove                                        |
| Teams    | Organizations and invites     | Single-user profile/settings only                                  |
| Platform | API keys                      | Activate webhooks or remove the developer surface                  |
| Demo     | `/auth/demo` disposable demo  | Delete during kickstart or replace with a product-specific demo    |

## Current Starter Surfaces

- Authenticated app: dashboard, billing, workspace, developer, assistant, editor, flow, map, Threlte, settings, admin users, admin organizations.
- Public site: landing, docs, blog, changelog, legal templates, component gallery, theme builder, auth screens, disposable demo.
- Backend: Convex auth, billing, organizations, entitlements, notifications, storage, API keys, maintenance jobs, and the template-event HTTP endpoint.

The kickstart agent should keep only the surfaces that support the selected product loop. Everything else should be deleted or documented as source material.

## Kickstart Flow

1. Run `bun create product-plate my-app` and choose the smallest fixed profile.
2. Open the generated `START_HERE.md` and build the real first product loop.
3. Configure only providers listed in `product-plate.json`.
4. Check setup with `bun run doctor`.
5. Verify production readiness with `bun run verify:launch`.

Use the longer prompt in the full repository's `START_HERE.md` only when the fixed profiles do not fit and you intentionally need the complete integration source.

## Provider Notes

- Autumn is already active through Convex and is the shortest Stripe-backed setup in this starter.
- Stripe direct gives maximum control, but requires careful webhook and subscription handling.
- Polar is a good fit when checkout sessions, benefits, and customer portal flows map to the product.
- Creem is a good fit when checkout sessions, signed webhooks, test mode, and software sales workflows are important.
- Drizzle is a good fit when SQL is the source of truth or the team already owns database infrastructure.
