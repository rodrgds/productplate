# create-product-plate

Create and maintain a focused Product Plate application with Bun.

## Create a project

Run the interactive initializer in a terminal:

```sh
bun create product-plate my-app
```

The prompts choose one product profile, product copy, a theme, dependency installation, and Git setup. Press `Ctrl+C` at any prompt to cancel without generating a partial project.

For scripts and CI, pass `--yes`. Only the destination is required:

```sh
bun create product-plate my-app --yes
```

`--yes` never reads stdin. It uses these defaults:

- profile: `prelaunch`
- name: the destination directory name
- description: `<name> application.`
- theme: `neutral`
- dependency install: enabled
- Git init: enabled outside an existing Git worktree and disabled inside one

Every default can be overridden:

```sh
bun create product-plate my-app \
  --profile=solo-saas \
  --name="My Product" \
  --description="A focused product." \
  --theme=claude \
  --no-install \
  --git \
  --yes
```

Supported profiles are `prelaunch`, `solo-saas`, `team-saas`, and `ai-saas`. Supported themes are `product-plate`, `claude`, `zen`, and `neutral`.

Run `bun create product-plate --help` for every option. `--template-version <semver>` selects a published release. `--template-path <path>` is intended for repository development and profile verification.

When prompts would be required but stdin is not a TTY, the command exits immediately with guidance to pass `--yes` or all required values. Unknown commands, unknown options, missing option values, and conflicting boolean flags also exit nonzero.

If copying or transforming the template fails, the incomplete destination is removed. If dependency installation, formatting, or Git initialization fails after generation, the source is kept and the error prints its location so the finishing step can be retried. `--no-install` output intentionally has no copied lockfile; run `bun install` and commit the new `bun.lock` before pushing because generated CI uses `--frozen-lockfile`.

Product names may contain quotes, apostrophes, ampersands, and markup characters. The generator serializes each TypeScript, Svelte, XML, Markdown, dotenv, and JSON context separately. Names must stay on one line; CR, LF, and Unicode line separators are rejected before a template is downloaded.

## Configure deployment

Generated projects use protected GitHub environments named `preview` and `production`. Each environment supplies its own `CONVEX_DEPLOY_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `RESEND_API_KEY`, and profile-specific provider secrets. The preview Convex key must be a preview deploy key. Production must use its production deploy key. In each environment, set `CLOUDFLARE_PROJECT_NAME`, `PUBLIC_POSTHOG_KEY`, `PUBLIC_SENTRY_DSN`, `SUPPORT_EMAIL`, and `TRANSACTIONAL_EMAIL_FROM`. Set `PUBLIC_POSTHOG_HOST` too when the project does not use PostHog's default host. The sender must contain a real address, such as `Product <mail@your-domain.com>`; missing, invalid, and reserved example-domain addresses fail before any runtime configuration changes.

In the `production` environment only, set `SITE_URL`, then set `product.productionUrl` in `product-plate.json` to the same final HTTPS origin. Preview auth uses the URL returned by Cloudflare. The strict production doctor treats the final URL, analytics, error reporting, support address, legal copy, and selected provider values as launch requirements.

Use a different `CLOUDFLARE_PROJECT_NAME` in each environment so preview and production secrets cannot overlap. The generated workflow creates a missing Pages project with `main` as its production branch, passes secret values to provisioning commands through stdin, and serializes all Pages configuration updates. It configures the selected Convex deployment and derives only `PRODUCT_NAME` from `product-plate.json`, so an infrastructure upgrade cannot replace the app's name or sender. Preview auth uses the deployment URL returned by Cloudflare instead of guessing a URL from the branch name.

After deployment, `/api/health` verifies the Pages bindings and a read-only Convex readiness query. The smoke script also checks the selected profile's waitlist, auth session, or chat route without creating product data.

## Check launch readiness

Generated projects include the maintenance CLI:

```sh
bun run doctor
bun run doctor -- --strict
bun run doctor -- --json
bun run doctor -- --live
```

`--strict` promotes launch-readiness warnings to failures. `--live` adds bounded deployed URL checks. `--json` produces structured output and never includes secret values. The command exits nonzero when a check fails.

## Upgrade managed infrastructure

Check before applying:

```sh
bunx product-plate upgrade --check
bunx product-plate upgrade --apply
```

Use `--manifest <https-url-or-local-path>` to inspect a specific schema-v2 release asset. Upgrade assets are selected for the app's recorded profile; an app never receives another profile's workflows or scripts.

Modern clients read the versioned `product-plate-upgrade-v2.json` release asset. The unversioned `product-plate-upgrade.json` name remains a schema-v1 compatibility manifest: it tells released v1 clients to update the CLI and deliberately conflicts before they can write profile-blind files.

The upgrader changes only checksum-tracked files that still match their recorded state. It rejects absolute paths, traversal, backslashes, control characters, protected metadata paths, and paths through symbolic links. Writes are staged, installed with atomic renames, and rolled back on failure. Successful upgrades keep a recovery snapshot under `.product-plate/backups/`.

If a managed file was edited, the command reports a conflict and leaves every file unchanged. Read the release migration notes, reconcile the file, and retry.

See the [Product Plate repository](https://github.com/rodrgds/productplate) for profile contracts, migrations, and release notes.
