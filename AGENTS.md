# Project Guidelines

## Core Technologies

- Frontend: SvelteKit ^2.30 with Svelte 5.
- Backend: Convex (database, serverless functions, real-time).
- Styling: Tailwind CSS v4 with shadcn-svelte components.
- Package Manager: bun.

## Key Conventions

- Package Management: IMPORTANT: Always use `bun` for all package management operations (`bun install`, `bun add`, etc.). YOU MUST NOT use `npm` or `yarn` and MUST NOT install tools globally.
- Development Environment: Inside the direnv environment, run the named commands directly (for example, `setup`, `dev`, or `verify`). Outside direnv, use `devenv shell -- <command>` (for example, `devenv shell -- setup`). `verify` is the normal NAS-safe lint/typecheck/unit gate; `verify-full` additionally runs the memory-heavy production build on a release-capable machine.
- Backend Development: Convex backend logic lives in the `src/convex/` directory.
- File-based Routing: Use SvelteKit's file-based routing system in `src/routes/`.
- Shared Code: Place reusable code in `src/lib/`.
- Use `git mv` instead of creating a new file and deleting the old one or just `mv` if moving existing files that have been committed already.
- Do not commit changes on your own. An explicit user request to commit authorizes it despite this default; otherwise humans commit after approval.
- Before making edits in files involving Svelte 5 or Convex, make sure you read the svelte/overview.md and convex.md documentation or you have it in your context.
- Most of the time, `bun dev` and `bun convex dev` will be running in another terminal already. No need to run those commands yourself.
- Use TDD by default whenever the task has a testable behavior surface: write or update a focused failing test first, implement the smallest useful change, then run the relevant test command before finishing. Skip TDD only for wiring/docs-only changes, throwaway prototypes, or when the user explicitly asks not to.
- For new product forks, start with `START_HERE.md`. The agent should ask product basics first, recommend what to keep/remove, activate one stack, then update docs.
- The public `/auth/demo` route creates a fresh disposable demo account for each hosted-preview visitor. Kickstart agents should delete `src/routes/auth/demo`, `src/lib/demo-account.ts`, and demo-account CTAs once the real product path exists.
- `_template_options/` contains inactive scaffolds for alternate billing and data choices. Do not import from it in active app code. Copy the selected scaffold into the app, then delete unused options.
- Public docs, blog, changelog, legal pages, component gallery, theme builder, workspace, developer, and admin screens are starter surfaces. Keep, rewrite, or remove them based on the selected product loop instead of leaving Product Plate copy in place.

## Recurring Workflow Playbook

### Start and scope

- Begin with `git status --short`, the current branch, and the relevant diff. This repository often has intentional work on an agent branch; treat every pre-existing change as user-owned.
- Check existing listeners before starting Vite, preview, or Convex. Reuse a healthy process when possible, and stop only processes you started.
- For an audit, stay read-only and finish with ranked, file-backed findings. For an implementation request, turn the findings into coherent tested slices instead of repeating the audit.

### Verification ladder

- Run the smallest focused Vitest or Playwright test first, then `verify` for normal handoff.
- Use `verify-full` only on a release-capable machine. It adds the dependency audit and memory-heavy production build.
- For generator or release work, run `bun run verify:profiles` from the repository root. It generates all four profiles and runs them sequentially so their fixed preview ports cannot collide. Pass one or more profile names after `--` for focused work, for example `bun run verify:profiles -- solo-saas`.
- Before publishing `create-product-plate`, also run `bun run verify` inside `packages/create-product-plate`, validate release assets, and prove the public package with `bun info create-product-plate version`, a clean `bun create product-plate ...`, and `bunx product-plate upgrade --check`. A started workflow or tag is not publication proof.

### Convex and authentication

- After Convex schema or function-signature changes, regenerate bindings immediately with `bunx convex codegen --typecheck disable` and run `bun run check` before starting the next large slice.
- If Better Auth schema changes, regenerate `src/convex/betterAuth/schema.ts` before checking dependent code. Treat Better Auth, `@convex-dev/better-auth`, Better Call, Zod, generated schema, and auth tests as one compatibility cohort.
- Reuse the working `convex-test` harness in `src/convex/security.test.ts`: register the Better Auth component and use `withIdentity(...)`. Do not invent fixture shapes from memory.
- Inspect `src/convex/organizations.ts` early for workspace, billing, invite, member, or admin work; it is the main trust-boundary hotspot.

### Browser and production proof

- For broad UI work, inspect the real routes at 390x844, 768x1024, 1280x720, and 1440x1000 where relevant. Cover light and dark themes, horizontal overflow, tap targets, actual interactions, and console errors.
- For sheets, popovers, and menus, assert the topmost hit-tested element after the transition finishes. DOM presence alone does not prove that a portalled layer is visible.
- Prefer `domcontentloaded` plus targeted locator waits. External fonts and analytics can make `load` or `networkidle` hang even when the interface is ready.
- Use a production build/preview for first-paint, hydration, performance, and release-sensitive checks. If a dev server watches generated output and becomes slow, restart it cleanly before judging the UI.
- Local auth E2E does not prove production auth. For a reported hosted auth bug, verify the deployed signup or disposable-demo entry, cookie handoff, logout, email sign-in, OAuth callback, and protected route as applicable. Production Cloudflare and Convex deployments are separate from local development.
- `PLAYWRIGHT_BASE_URL=<deployment-url> bun run test:e2e` targets a deployed build without starting a local server. Do not create persistent production test data when the disposable demo can prove the behavior.

### Starter surfaces and generated assets

- When starter capabilities or identity change, inspect `START_HERE.md`, `README.md`, `PRODUCT.md`, `AGENTS.md`, `docs/template-options.md`, `.env.example`, and `CHANGELOG.md` together. Update only the files whose claims actually changed.
- For README or marketing screenshot work, use a local app and run `SCREENSHOT_BASE_URL=http://127.0.0.1:<port> bun run screenshots:readme`. The capture script intentionally refuses remote account creation unless it is explicitly overridden.
- Review `static/og.png`, `static/screenshots/`, the landing page consumers, and README references as one asset set. If an image keeps the same filename, update the README cache-busting query so GitHub does not serve its stale proxy copy.

## Writing and product copy

- Avoid stock metaphors, similes, idioms, and figures of speech.
- Prefer short, familiar words when they keep the exact meaning. Cut words and sections that add no meaning.
- Prefer active voice when it makes the actor and action clearer.
- Replace jargon, foreign phrases, and needless scientific or academic terms with everyday English.
- Break any rule when accuracy, natural phrasing, tone, legal meaning, accessibility, or readability requires it.
- Apply these rules in context, not as blind replacements. Preserve code, commands, API fields, product names, citations, quotes, legal wording, and exact technical terms unless they are the copy being improved.
- Finish every copy change with a line-by-line prose review.

## Svelte Best Practices

### High-Level Principles

- Write concise, technical, and accurate Svelte 5/SvelteKit code.
- Use SSR and SSG where they fit.
- Prioritize performance and minimal JavaScript.
- Use descriptive variable names and follow official conventions.

### Code Style and Structure

- Prefer functional and declarative patterns.
- Avoid code duplication through iteration and modularization.
- Structure files logically: component logic, markup, styles, helpers, types.

### TypeScript Usage

- Use TypeScript for all code.
- Prefer interfaces over types.
- Avoid enums; use `as const` objects.
- Enable strict mode.
- Don't use Any as type. That's not precise or clear enough.

## Available Documentation

Refer to the following documents for detailed information on specific topics. These are your primary source of truth for the project. Always double-check when in doubt.

- `README.md`: Project overview, technology stack, features, setup instructions, deployment, and development workflow.
- `docs/autumn.md`: Guidelines for integrating Autumn billing and subscription management with SvelteKit and Convex.
- `docs/better_auth.md`: A guide to using Better Auth for the project's authentication system, with links to official documentation.
- `docs/convex.md`: Guidelines and best practices for Convex (database schema, queries, mutations).
- `docs/tailwind_v4.md`: Overview of Tailwind CSS v4, including the new CSS-first customization and dynamic utilities.
- `docs/template-options.md`: Selection-model guidance for inactive provider and database scaffolds.
- `docs/themes.md`: Theme presets and token guidance for activating one coherent product identity.
- `docs/observability-security.md`: Request logging, security headers, hashed API key/webhook secret, and access-control defaults.
- `docs/svelte/overview.md`: Comprehensive Svelte 5 guide covering component patterns, state management, and conventions.
- `docs/svelte/advanced_state_management.md`: Patterns for reusable state stores and a guide on avoiding common pitfalls with effects.
- `docs/svelte/animations_and_integrations.md`: Guide to Svelte 5's animation features and integrating third-party libraries.
- `docs/svelte/templating_and_components.md`: Advanced templating, data binding, and component composition with snippets and the Context API.
- `docs/svelte/remote_functions.md`: In-depth guide to SvelteKit's remote functions (`query`, `form`, `command`).
- `docs/svelte/reactivity_deep_dive.md`: Advanced look at Svelte 5's reactivity model, signals, and effects.

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`src/convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.
