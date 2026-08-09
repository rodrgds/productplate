# From create to production

## 1. Create the app

```sh
bun create product-plate my-app
cd my-app
```

Choose the smallest profile that contains the first paid or validated product loop. Use `prelaunch` until accounts are necessary, `solo-saas` for individual products, `team-saas` only when collaboration is visible, and `ai-saas` for an individual AI product.

## 2. Run locally

```sh
bun convex dev
bun run dev
```

The generator installs with Bun, writes ignored local secrets, and keeps Devenv optional. Follow the generated `START_HERE.md` to replace the starter identity and first screen with the real product loop.

## 3. Configure selected providers

Copy values from `.env.example` into `.env.local`. Configure only providers named in `product-plate.json`. PostHog and Sentry stay disabled locally until their public keys are present. Production strict checks require real PostHog and Sentry values. Production auth profiles also require Resend delivery and `AUTH_REQUIRE_EMAIL_VERIFICATION=true`.

Check progress without exposing secret values:

```sh
bun run doctor
bun run doctor -- --json
```

## 4. Open a preview

Create protected GitHub environments named `preview` and `production`. In each environment, add an environment-specific `CONVEX_DEPLOY_KEY`, Cloudflare credentials, `RESEND_API_KEY`, and the provider secrets named in the generated README. The preview key must be a Convex preview deploy key; the production key must target production.

Set a different `CLOUDFLARE_PROJECT_NAME` in each environment. Set the production `SITE_URL`, `PUBLIC_POSTHOG_KEY`, `PUBLIC_SENTRY_DSN`, `SUPPORT_EMAIL`, and a real sender such as `Product <mail@your-domain.com>` in `TRANSACTIONAL_EMAIL_FROM`. Set `PUBLIC_POSTHOG_HOST` when the project does not use PostHog's default host. A pull request creates or reuses its branch-scoped Convex preview, creates the selected Pages project if it is missing, builds against that deployment, provisions runtime bindings, deploys the same artifact, and uses Cloudflare's returned URL for auth and smoke checks. Preview data and runtime secrets never use the production targets.

## 5. Launch

Replace legal placeholders, publish or unlink the empty blog, and set `product.productionUrl` in `product-plate.json` to the same final HTTPS origin as the production `SITE_URL`. Then run:

```sh
bun run verify:launch
```

Migrate Convex schemas with widen-migrate-narrow because the backend activates before the new Cloudflare artifact. Merging to `main` builds first, deploys Convex, uploads the same build artifact to Cloudflare Pages, and records the frontend URL, Git SHA, smoke result, and rollback instruction.

## 6. Keep infrastructure current

```sh
bunx product-plate upgrade --check
bunx product-plate upgrade --apply
```

Upgrade applies only unchanged generator-managed infrastructure. Modified product files and conflicted infrastructure are left untouched with manual migration instructions.

Ask questions and share finished products in [GitHub Discussions](https://github.com/rodrgds/productplate/discussions).
