# Contributing

Thanks for considering a contribution to Product Plate.

Product Plate is a starter, not a framework. Contributions should make the default product foundation clearer, safer, easier to customize, or easier to evaluate.

## Good contributions

Good changes usually fit one of these groups:

- Fixes for broken setup, auth, billing, deployment, tests, or demo flows.
- Better docs for real customization work.
- Cleaner default UI/components without making the starter visually heavy.
- Small improvements to accessibility, responsiveness, performance, or reduced-motion behavior.
- Optional provider scaffolds that stay inactive until selected during kickstart.
- Tests that protect existing starter behavior.

## Avoid

Please avoid changes that make the starter harder to fork into a real product:

- Runtime provider switchers for billing/database/auth unless there is a strong product reason.
- Heavy abstractions over ordinary SvelteKit or Convex code.
- Decorative components that do not help people start a product.
- Imports from `_template_options` in active application code.
- Vendor-specific setup that becomes mandatory for every user.

## Local development

Use Bun for package management and scripts.

```sh
git clone https://github.com/rodrgds/productplate.git
cd productplate
bun install
cp .env.example .env.local
bun convex dev
bun dev
```

For the Devenv path:

```sh
devenv shell
setup
devenv up
```

## Before opening a pull request

Run the smallest relevant checks for your change. For most changes, this means:

```sh
bun run lint
bun run check
bun run test:unit
bun run build
```

For route, auth, onboarding, billing, or public-page changes, also run:

```sh
bun run test:e2e
```

## Template conventions

- Use `bun`, not npm or yarn.
- Keep active app code in `src/routes`, `src/lib`, and `src/convex`.
- Treat `_template_options` as inactive source material only.
- Preserve the `START_HERE.md` kickstart flow when changing the starter structure.
- The hosted `/auth/demo` route supports the hosted preview and should usually be removed when someone forks Product Plate into a real product.

## Pull request description

Include:

- What changed.
- Why it matters for starter users.
- What commands you ran.
- Any external service keys or dashboards needed to verify the change.
