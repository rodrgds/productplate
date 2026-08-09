# Changelog

All notable changes to Product Plate will be documented in this file.

Product Plate follows semantic versioning while it is useful for template consumers. Before `v1.0.0`, breaking changes can still happen, but they should be called out clearly in release notes.

## Unreleased

### Added

- A local `verify:profiles` command that generates and verifies release profiles sequentially.
- A Commander and Clack initializer flow with strict non-interactive defaults, plus profile-aware managed upgrades with backups and rollback.

### Fixed

- README screenshot capture now reuses its local onboarding session and refuses remote account creation unless explicitly allowed.
- Generated projects now preserve license attribution, remove starter social artwork, clean temporary downloads, and retain source when optional finishing steps fail.
- Managed upgrades now validate release schemas, product profiles, checksums, paths, and symlink ancestry before changing project files.
- Generated deployment workflows now create missing Pages projects, provision profile-specific Cloudflare and Convex runtime values, use the deployed preview origin, validate the email sender, and check runtime readiness before reporting success.
- Release automation now uploads and verifies GitHub assets before publishing npm, while separate legacy and profile-aware upgrade manifests keep existing clients safe.
- The dashboard now reports live account and workspace state instead of static sample metrics, with corrected route landmarks, navigation state, and async action feedback.
- Generated dependency pruning now ignores documentation examples, keeps evidence-backed tooling, and removes stale PWA type references.
- Dependency audits now resolve fixed releases of `brace-expansion`, `fast-uri`, `js-yaml`, `nanoid`, `postcss`, and `undici`.

### Changed

- Devenv and CI now use Bun 1.3.13 from the pinned nixpkgs package on supported Linux and macOS systems.
- Confirmed dead dashboard, chart, table, navigation, attachment, screenshot, workflow, and duplicate PWA assets were removed. Optional Mist marketing sections now live under `_template_options/`.
- ESLint now uses one flat configuration and checks active UI primitives instead of ignoring them.

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
