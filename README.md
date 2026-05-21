# CodeSpring 2026

This repo is the starting point for a CodeSpring 2026 hackathon project. The stack and reusable building blocks are intact; the template branding and template-marketing copy have been removed.

## Stack

- SvelteKit 2 + Svelte 5
- Convex
- Better Auth
- Autumn billing
- Tailwind CSS v4
- shadcn-svelte
- Bun

## What stays

- Auth flows
- Protected app shell
- Billing integration scaffolding
- Reusable UI components
- Project docs in `docs/`
- Cloudflare adapter and deploy workflow

## Local development

1. Install dependencies:

```sh
bun install
```

2. Run Convex in one terminal:

```sh
bun x convex dev
```

3. Run SvelteKit in another:

```sh
bun dev
```

## Environment

You need build-time env vars for SvelteKit and runtime env vars for Convex.

### SvelteKit / Cloudflare Pages build vars

- `PUBLIC_CONVEX_URL`
- `PUBLIC_CONVEX_SITE_URL`
- `SITE_URL`

### Convex env vars

Required:

- `SITE_URL`
- `BETTER_AUTH_SECRET`

Optional, depending on what you use:

- `RESEND_API_KEY`
- `RESET_EMAIL_FROM`
- `RESET_EMAIL_REPLY_TO`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AUTUMN_SECRET_KEY`

## Deploying to Cloudflare Pages

This project is already using `@sveltejs/adapter-cloudflare`, so Pages is the path of least resistance.

1. Deploy Convex first:

```sh
bun convex deploy
```

2. Set production env vars in Convex:

```sh
bun convex env set --prod SITE_URL https://your-domain.pages.dev
bun convex env set --prod BETTER_AUTH_SECRET your-secret
```

Add the optional email, OAuth, and billing vars if your app uses them.

3. In Cloudflare Pages, create a new project and connect the repo.

4. Use these build settings:

- Build command: `bun run build`
- Build output directory: `.svelte-kit/cloudflare`
- Node version: `20`

5. In Cloudflare Pages, add build-time environment variables:

- `PUBLIC_CONVEX_URL`
- `PUBLIC_CONVEX_SITE_URL`
- `SITE_URL=https://your-domain.pages.dev`

6. If auth is enabled, make sure `SITE_URL` matches the final Pages domain exactly.

### GitHub Actions option

The repo includes a Cloudflare Pages workflow in `.github/workflows/cloudflare-pages.yml`.

The workflow selects the `production` environment on `main` and `development` otherwise.
Set these GitHub environment variables in both environments:

- `PUBLIC_CONVEX_URL`
- `PUBLIC_CONVEX_SITE_URL`
- `SITE_URL`
- `CLOUDFLARE_PROJECT_NAME` (optional if the repo name matches the Pages project)

Set these GitHub secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Notes

- Use `bun` only.
- The docs in `docs/` are the repo’s reference material for Svelte, Convex, Tailwind, Better Auth, and Autumn.
- There is still app scaffolding in place. Remove or reshape routes once the hackathon direction is clear.
