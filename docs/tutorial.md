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

Copy values from `.env.example` into `.env.local`. Configure only providers named in `product-plate.json`. PostHog and Sentry stay disabled until their public keys are present. Production auth profiles require Resend delivery and `AUTH_REQUIRE_EMAIL_VERIFICATION=true`.

Check progress without exposing secret values:

```sh
bun run doctor
bun run doctor -- --json
```

## 4. Open a preview

Add separate `CONVEX_PREVIEW_DEPLOY_KEY` and `CONVEX_PRODUCTION_DEPLOY_KEY` secrets, Cloudflare credentials, and `CLOUDFLARE_PROJECT_NAME` to GitHub. A pull request creates or reuses a branch-scoped Convex preview, builds against that deployment, uploads the Cloudflare preview, and runs the public smoke test. Preview data never uses the production key.

## 5. Launch

Replace legal placeholders, publish or unlink the empty blog, set the final production URL, and run:

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
