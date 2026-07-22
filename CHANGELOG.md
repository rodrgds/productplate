# Changelog

All notable changes to Product Plate will be documented in this file.

Product Plate follows semantic versioning while it is useful for template consumers. Before `v1.0.0`, breaking changes can still happen, but they should be called out clearly in release notes.

## Unreleased

No changes yet.

## [1.0.0]

### Added

- Safe `product-plate upgrade --check` and `--apply` support for unchanged generator-managed infrastructure.
- Release assets with archive checksums, provenance, migration notes, tag and package version checks, and GitHub release automation.
- A create-to-production tutorial, GitHub Discussions support path, and repository-backed reviewed showcase.

### Changed

- The README now leads with `bun create product-plate`; direct cloning is reserved for contributors and full-demo inspection.
- Stable releases require all four generated profiles to pass frozen install, lint, typecheck, unit, audit, build, and browser smoke gates.

## [0.4.0]

### Added

- Consent-gated PostHog telemetry with a typed event contract and no-op behavior when unconfigured.
- Optional Sentry integration with credential and user-content scrubbing, Git SHA tags, request IDs, and support actions.
- mdsvex content, typed metadata, generated sitemap, robots, RSS, article schema, and noindex behavior for empty content.
- One typed email renderer and delivery service covering verification, reset, email change, welcome, invite, waitlist, and subscription messages.
- Production email verification controls, password-reset session revocation, explicit Better Auth rate limits, and an optional disabled magic-link recipe.
- Authenticated feedback storage and operator status management with `SUPPORT_EMAIL` as the universal fallback.

## [0.3.0]

### Added

- Profile-aware `doctor`, JSON output, strict production checks, live checks, and `verify:launch`.
- One build-first deployment workflow for isolated Convex previews, production Convex, Cloudflare Pages, public smoke tests, summaries, and rollback guidance.

## [0.2.0]

### Added

- The `create-product-plate` Bun package and fixed `prelaunch`, `solo-saas`, `team-saas`, and `ai-saas` profiles.
- Typed capability resolution, safe destination handling, tagged archive checksums, identity and metadata rewrites, secure local secrets, dependency pruning, and `product-plate.json`.
- A real Convex waitlist with normalized idempotent subscriptions, hashed requester fingerprints, bounded rate limits, signed unsubscribe links, optional Resend delivery, and secret-based export.
- A generated-profile CI matrix covering every fixed profile.

## Full demo foundation

### Added

- Workspace and organization model with members, invites, entitlements, notifications, API keys, audit logs, and usage counters.
- Public docs, blog, changelog, legal starter pages, and theme builder.
- Request IDs, default security headers, and optional request logging.
- Expanded `START_HERE.md` coverage for workspaces, developer surfaces, admin/operator surfaces, docs cleanup, screenshots, and theme builder cleanup.
- Non-mutating browser smoke coverage in the code-quality workflow.
- Automated disposable-demo expiration, account cleanup, and operational-data retention.
- Ten reusable SaaS landing sections spanning product storytelling, proof, trust, ROI, and migration.

### Changed

- Workspace selection is explicit and onboarding creates the workspace name entered by the user.
- Billing and entitlements are scoped to the active organization and restricted to workspace administrators.
- Webhooks remain inactive compatibility storage until a real signed delivery pipeline is selected.
- PWA generation is opt-in and avoids precaching authenticated product routes.
- Public changelog content now comes directly from this file.

### Fixed

- Account deletion now blocks unsafe owner removal and cleans related application data.
- Protected, auth, placeholder legal, and empty blog routes now publish appropriate indexing directives.
- The sitemap contains only truthful, indexable public routes.

## [0.1.0] - 2026-06-25

### Added

- Initial public release of Product Plate as an open-source SvelteKit SaaS starter.
- SvelteKit 2, Svelte 5, TypeScript, Tailwind CSS v4, shadcn-svelte, Bun, and Cloudflare Pages setup.
- Convex backend with realtime queries, typed functions, storage patterns, and server-side auth helpers.
- Better Auth email/password flow, Google OAuth wiring, forgot-password and reset-password screens.
- Protected app shell with dashboard, settings, profile, billing, admin users, assistant, editor, graph, and 3D demo routes.
- Autumn billing integration backed by Stripe, with product cards, checkout, and billing portal hooks.
- AI assistant route using the Vercel AI SDK with streaming, Markdown rendering, suggestions, and tool patterns.
- Hosted disposable demo-account entrypoint at `/auth/demo` for public evaluation.
- Landing page, reusable landing component gallery, README screenshots, PWA setup, and deployment wiring.
- `START_HERE.md` kickstart prompt for turning the starter into a real product with an AI coding agent.
- Inactive `_template_options` scaffolds for alternate billing and data choices.
- Vitest, Playwright, ESLint, Prettier, Svelte diagnostics, and a Cloudflare Pages GitHub Actions workflow.

### Notes

- This is a `v0.1` starter release, not a locked API or framework contract.
- The default stack is Convex, Better Auth, Autumn, SvelteKit, Tailwind CSS v4, shadcn-svelte, Bun, and Cloudflare Pages.
- Planned follow-up work includes project creation CLI, Drizzle/Postgres/SQLite options, Polar support, and stronger SEO defaults.
