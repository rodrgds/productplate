# Changelog

All notable changes to Product Plate will be documented in this file.

Product Plate follows semantic versioning while it is useful for template consumers. Before `v1.0.0`, breaking changes can still happen, but they should be called out clearly in release notes.

## Unreleased

### Added

- Workspace and organization model with members, invites, entitlements, notifications, API keys, webhooks, audit logs, and usage counters.
- Public docs, blog, changelog, legal starter pages, and theme builder.
- Request IDs, default security headers, and optional request logging.
- Expanded `START_HERE.md` coverage for workspaces, developer surfaces, admin/operator surfaces, docs cleanup, screenshots, and theme builder cleanup.

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
- Planned follow-up work includes project creation CLI, Drizzle/Postgres/SQLite options, Polar support, stronger SEO defaults, and more landing components.
