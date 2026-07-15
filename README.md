<p align="center">
  <img src="./docs/images/reddit.png?v=2026-07-09-refresh" alt="Product Plate product starter overview" width="100%" />
</p>

<h1 align="center">Product Plate</h1>

<p align="center">
  <strong>SvelteKit starter, ready to become your product.</strong>
</p>

<p align="center">
  Auth, billing, realtime data, AI, product UI, tests, and deployment, plus a practical prompt that helps your coding agent turn the starter into a focused product.
</p>

<p align="center">
  <a href="https://productplate.pages.dev/auth/demo">Live demo</a>
  ·
  <a href="./START_HERE.md">Kickstart prompt</a>
  ·
  <a href="https://productplate.pages.dev/components">Component gallery</a>
  ·
  <a href="./LICENSE">MIT license</a>
</p>

## Why this exists

Most starters save setup time, then leave you with a permanent showcase app.

Product Plate gives you two things:

- A working SvelteKit product foundation with connected routes and integrations.
- [`START_HERE.md`](./START_HERE.md), a guided prompt that tells your coding agent how to keep what fits, remove what does not, rename the product, update the docs, and verify the result.

The goal is a smaller first version of your product, not a renamed template.

## See the product

The hosted demo creates a fresh disposable account and opens the authenticated app:

- [Open the live demo](https://productplate.pages.dev/auth/demo)

<p align="center">
  <img src="./static/screenshots/dashboard.png?v=2026-07-09-refresh" alt="Product Plate dashboard" width="100%" />
</p>

<p align="center">
  <img src="./static/screenshots/onboarding-filled.png?v=2026-07-09-refresh" alt="Product Plate onboarding" width="49%" />
  <img src="./static/screenshots/editor.png?v=2026-07-09-refresh" alt="Product Plate editor" width="49%" />
</p>

<p align="center">
  <img src="./static/screenshots/flow.png?v=2026-07-09-refresh" alt="Product Plate workflow editor" width="49%" />
  <img src="./static/screenshots/map.png?v=2026-07-09-refresh" alt="Product Plate map workspace" width="49%" />
</p>

<p align="center">
  <img src="./static/screenshots/threlte.png?v=2026-07-09-refresh" alt="Product Plate 3D workspace" width="49%" />
  <img src="./static/screenshots/assistant.png?v=2026-07-09-refresh" alt="Product Plate AI assistant" width="49%" />
</p>

## What is wired

- **App:** SvelteKit 2, Svelte 5, TypeScript, Tailwind CSS v4, shadcn-svelte.
- **Backend:** Convex functions, realtime data, storage, organizations, notifications, API keys, and generated types.
- **Accounts:** Better Auth, email/password, Google OAuth wiring, reset flows, onboarding, profiles, protected routes, and admin roles.
- **Billing:** Autumn checkout, subscription state, and customer portal patterns.
- **AI:** Vercel AI SDK route, streaming assistant UI, Markdown, suggestions, and tool calls.
- **Product UI:** dashboard, profile/settings, workspace invites, developer API keys, admin, editor, graph, map, 3D, uploads.
- **Public UI:** landing page, docs, blog, changelog, legal templates, component gallery, and theme builder.
- **Delivery:** Bun, Vitest, Playwright, PWA support, request IDs, security headers, GitHub Actions, Cloudflare Pages.

## Start here

```sh
git clone https://github.com/rodrgds/productplate.git my-product
cd my-product
```

Before installing dependencies, open [`START_HERE.md`](./START_HERE.md) in your coding agent. It will:

1. Ask what you are building.
2. Recommend what to keep, reshape, remove, or decide later.
3. Select one active backend, auth, billing, AI, team, developer, and public-site path.
4. Build the smallest coherent product loop.
5. Update identity, routes, docs, tests, and deployment settings.

Product Plate pins Bun 1.3.3 in its devenv. With direnv installed, allow the environment once, then run the named commands directly:

```sh
direnv allow
setup
convex-dev
dev
```

Without direnv, enter the same pinned environment for each command:

```sh
devenv shell -- setup
devenv shell -- convex-dev
devenv shell -- dev
```

`setup` performs a frozen install and creates `.env.local` from `.env.example` only when `.env.local` is missing. It never overwrites existing local configuration. The install is staged beside the repository and moves `node_modules` into the project, keeping dependency state on the durable `/workspace` filesystem rather than `/tmp`.

Open `http://localhost:5173`.

For local auth, set the same URL in Convex:

```sh
bun convex env set SITE_URL http://localhost:5173
```

## Environment

Minimum local variables:

```env
CONVEX_DEPLOYMENT=
PUBLIC_CONVEX_URL=
PUBLIC_CONVEX_SITE_URL=
SITE_URL=http://localhost:5173
BETTER_AUTH_SECRET=
```

Optional integrations:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
OPENROUTER_API_KEY=
AUTUMN_SECRET_KEY=
```

Use [`.env.example`](./.env.example) for local configuration and [`.env.server.example`](./.env.server.example) for production-only secrets.

The devenv Bun wrapper asks Node to parse `.env` and `.env.local` as data, then invokes the pinned Bun binary with `--no-env-file`. Dotenv files are never sourced or evaluated as shell code, and their contents are not embedded in the Nix store. Raw Bun setup also uses `--no-env-file` in a clean environment.

## Commands

Run these names directly inside direnv or as `devenv shell -- <command>` outside it. No Git hook rewrites or stages files; run `verify` explicitly before handoff or commit. Use `verify-full` on a release-capable machine when the resource-heavy production build is required.

| Command        | Purpose                                        |
| -------------- | ---------------------------------------------- |
| `install`      | Install exactly from `bun.lock`                |
| `setup`        | Frozen install; create `.env.local` if missing |
| `dev`          | Start SvelteKit                                |
| `convex-dev`   | Start Convex                                   |
| `check`        | Typecheck Svelte and TypeScript                |
| `typecheck`    | Alias for `check`                              |
| `format-check` | Check formatting without changes               |
| `lint`         | Check formatting and ESLint                    |
| `test-unit`    | Run Vitest                                     |
| `test-e2e`     | Run Playwright                                 |
| `build`        | Build for production                           |
| `verify`       | Run lint, checks, and unit tests               |
| `verify-full`  | Run `verify`, then build for production        |

## Project map

```text
src/routes/                 Public, auth, API, and product routes
src/routes/(app)/           Authenticated app shell and product examples
src/routes/docs/            Public setup and architecture docs page
src/routes/theme-builder/   Theme-token builder for kickstart styling
src/lib/components/ui/      shadcn-svelte primitives
src/lib/components/ai/      Streaming assistant and tool components
src/lib/components/landing/ Reusable marketing component gallery
static/screenshots/         Product screenshots used by the site and README
src/hooks.server.ts         Request IDs, security headers, optional request logs
src/convex/                 Schema, auth, billing, orgs, developer APIs, storage, crons
_template_options/          Inactive provider and database scaffolds
docs/                       Integration, theme, template-option, observability/security guidance
```

## Deployment

The default production path is Convex plus Cloudflare Pages.

```sh
bun convex deploy
bun run build
```

Cloudflare Pages:

```text
Build command: bun run build
Build output: .svelte-kit/cloudflare
Node.js: 22
```

The included GitHub Actions workflow runs checks and deploys `main` after the required Cloudflare secrets and repository variables are configured.

## License

MIT. Use it for personal, commercial, closed-source, or open-source products.
