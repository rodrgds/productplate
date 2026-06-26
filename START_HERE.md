# Product Plate Kickstart Prompt

Copy the prompt below into your AI coding agent after cloning Product Plate. Run it from the repository root before your first real product commit.

The goal is not to polish the template. The goal is to turn the template into your product.

```text
You are customizing this Product Plate clone into a real product. Work in the current repo. Do not do a generic cleanup. Interview me, recommend what to keep/remove, then implement the chosen setup.

Core rule:
Product Plate is a selection-based starter. Pick one active product shape and one active stack path. Remove or ignore the rest. Do not build runtime provider switchers unless I explicitly need multiple providers at runtime.

Definition of done:
The result must feel like a first version of the real product, not a renamed starter. Build the smallest coherent product loop from the answers: real identity, real logo/assets, real routes, real data model, real forms/actions, real empty states, real navigation, real public/protected surfaces when needed, and product-specific tests. Do not leave the requested core product as TODOs unless blocked by a missing secret or an explicit product decision.

Operating rules:
- Follow AGENTS.md first.
- Use bun for every package command.
- Do not commit unless I explicitly ask.
- Before Svelte edits, read docs/svelte/overview.md.
- Before Convex edits, read docs/convex.md and src/convex/_generated/ai/guidelines.md.
- Use TDD for testable behavior changes: add/update a focused test first, implement, then run the relevant command.
- Ask at most 3 short questions at a time, except the initial four product basics below.
- Be opinionated. Recommend what to keep and remove instead of listing every possible option.
- Treat /auth/demo as temporary public-preview material. Delete src/routes/auth/demo, src/lib/demo-account.ts, and every demo-account CTA once the real product path exists, unless I explicitly ask to keep a hosted demo.
- Treat _template_options/ as inactive source material. Do not import from it in production code.
- Prefer simple, durable product code over preserving starter showcases.

Phase 1 - product basics only:
Ask exactly these first, then wait:
1. What is the product name?
2. What does it do, and who is it for?
3. What should be true for the first launch version?
4. What visual style, colors, and fonts do you want? (e.g. Claude theme, Zen theme, a standard shadcn palette like Slate/Stone, or custom colors/fonts? See docs/themes.md for preset details.)

Phase 2 - inspect the starter:
Inspect these files and folders before recommending changes:
- README.md
- PRODUCT.md
- AGENTS.md
- package.json
- src/lib/constants.ts
- src/routes/
- src/routes/components/
- src/routes/(app)/
- src/lib/components/
- src/lib/components/landing/
- src/lib/components/mist/
- src/convex/
- .env.example
- .env.server.example
- _template_options/
- docs/template-options.md
- docs/themes.md

Then summarize the starter surfaces in four compact groups:
- Keep as-is
- Keep but rename/restyle
- Remove now
- Decide later

For each recommendation, explain why in one sentence.

Phase 3 - choose the product shape:
Offer a recommended default first. Only ask about choices that matter for this product.

Data/backend:
- Convex, recommended when realtime data, serverless functions, file storage, and fast iteration matter.
- Drizzle with PostgreSQL, recommended when SQL ownership, joins, reporting, or existing DB infrastructure matter.
- Drizzle with SQLite/Turso/D1, recommended for small apps or edge-heavy deployments.
- Custom backend, only when I already have a backend to integrate.

Auth:
- Better Auth, recommended default.
- Better Auth with OAuth only.
- Email/password only.
- No accounts yet, only for static demos, waitlists, or pre-auth prototypes.

Billing:
- Autumn, recommended default when Stripe-backed billing with less custom billing code is enough.
- Stripe direct, recommended when I need full Stripe control, custom webhooks, Connect, or advanced subscription behavior.
- Polar, recommended when checkout, benefits, and merchant-of-record style workflows fit better.
- Creem, recommended when license keys, signed webhooks, and software-sales workflows matter.
- None/waitlist, recommended if the first launch does not charge.

AI:
- Keep the AI SDK chat route and assistant UI.
- Keep only the backend chat/API pattern.
- Remove AI until the product needs it.

Product UI:
- Keep dashboard/settings/profile/admin as a base.
- Keep only landing plus auth.
- Replace the app shell with a product-specific first screen.
- Keep component-gallery pages only if useful as source examples; otherwise remove from the user-facing app.

Marketing site:
- Rename and rewrite the landing page for the real product.
- Remove Product Plate-specific claims from public copy.
- Keep only the sections that sell the actual product.

Visual style / identity:
- Claude theme (warm sand background, Outfit/Geist Mono fonts, oklch colors).
- Zen inspired theme (minimal earthy tones, Inter/Playfair Display/JetBrains Mono fonts, hsl colors).
- Standard shadcn-svelte presets (Neutral, Stone, Zinc, Gray, Slate).
- Custom variables (configure custom background, foreground, primary, fonts, border radius, and shadows).

Deployment:
- Keep Cloudflare Pages unless I name another target.
- Keep Convex hosting for backend functions and data when Convex remains active.

Phase 3.5 - turn the idea into an implementation plan:
Before editing files, convert my answers into a compact implementation contract. Do not ask me to manually specify obvious product features; infer them from the product description and first-launch requirements.

Include:
- Core nouns/data objects (for example: projects, posts, votes, customers, tasks, documents, messages).
- Core verbs/actions (for example: create, edit, list, filter, publish, upload, vote, summarize, invite, archive).
- Public surfaces and protected surfaces.
- Required routes and layouts.
- Required database tables or storage buckets.
- Required forms and validation schemas.
- Required reusable components.
- Required empty/loading/error states.
- Required smoke tests and unit tests.
- Things intentionally deferred to V1.1.

Then implement that contract after confirmation. The implementation must cover the real V1 loop end-to-end. A renamed dashboard with fake cards is not enough.

Phase 4 - implement after confirmation:
Identity, copy, and brand assets:
- Update src/lib/constants.ts.
- Update package.json name and version only if appropriate.
- Update README.md to describe the new product, not Product Plate.
- Update PRODUCT.md with the real product, users, brand voice, and design principles.
- Update AGENTS.md so future agents know the selected stack, active provider, backend path, chosen product loop, and removed template surfaces.
- Update page titles, metadata, sitemap/robots if needed, PWA manifest values, landing copy, CTA hrefs, and visible Product Plate mentions.
- Search for old template names/URLs with rg: Product Plate, productplate, productplate.pages.dev, Demo Workspace, Product Plate Demo.
- Create a simple product logo/mark if I do not provide one. At minimum update static/favicon.svg, src/lib/assets/favicon.svg if present, app-logo/brand-logo components, PWA icons/manifest colors, and the OG image or an explicit placeholder. Do not leave Product Plate branding in the generated product.
- The logo should match the selected visual style and product concept. Prefer a clean SVG mark/wordmark over a generic emoji or untouched starter icon.

Visual style & theme activation:
- Set up theme CSS variables, font families, radius, and shadows in src/app.css.
- If using Google fonts or external fonts, add font import declarations at the top of src/app.css or head links in src/app.html.
- Update standard layout styles or headings to reference the configured serif/sans font families.
- Refer to docs/themes.md for instructions and code blocks for Claude, Zen, and shadcn-svelte default themes.
- If docs/themes.md is missing or incomplete, still implement the selected style from the theme description and document the chosen tokens in PRODUCT.md or README.md.

Core product feature implementation:
- Build the smallest complete version of every feature I named as part of the first launch version.
- Create the real data model for the product loop. Do not keep demo rows, fake dashboards, placeholder metrics, or starter-only data if the product needs real user data.
- Add routes that reflect the product nouns and workflows, not generic starter sections.
- Add create/edit/list/detail views for the primary object when the product needs management.
- Add product-specific settings when the product has configurable entities, not just user account settings.
- If the product has public and authenticated roles, implement both views. Logged-out read-only views and logged-in mutation flows should be clear.
- If the product mentions uploads, markdown, rich text, AI, realtime data, votes, comments, invitations, teams, or billing, either implement the minimal V1 version or explicitly put it in Decide later with a reason.
- Prefer simple implementations for V1: textarea + markdown preview beats a heavy editor unless I ask for WYSIWYG; simple file input + selected storage provider beats preserving Uppy demos unless the product truly needs Uppy.
- Add useful empty states and first-use CTAs. A fresh project/user should not land on a dead dashboard.

Demo account:
- Delete src/routes/auth/demo and src/lib/demo-account.ts unless I explicitly keep a public demo.
- Remove /auth/demo from README, landing CTAs, tests, navigation, and docs.
- If keeping a demo account, make it product-specific, disposable, safe, and outside paid/private workflows.
- Do not create a separate public /demo page unless I explicitly ask.

Provider activation:
- Use _template_options as inactive source material only.
- Copy the selected payment or database scaffold into the real app location, then rename .example files to real extensions.
- Do not import from _template_options in active app code.
- Delete unselected _template_options folders after the chosen stack is active.
- Remove unselected provider env vars, docs, dependencies, route links, components, and tests unless they are intentionally kept as docs-only reference material.
- If selecting Autumn, keep the current src/convex/autumn.ts, src/convex/billing.ts, and docs/autumn.md path unless the product needs a different billing model.
- If selecting Stripe direct, add Stripe env vars, create server-only checkout/webhook routes, and remove Autumn packages/component wiring if no longer used.
- If selecting Polar, keep access tokens server-side, create checkout sessions server-side, and document portal/benefit access.
- If selecting Creem, keep API keys server-side, create checkout sessions server-side, and verify signed webhooks before mutating access.
- If selecting Drizzle, add the correct driver with bun, create src/lib/server/db, add migrations, update auth adapter plans, and remove Convex app code only after replacements work.

Route cleanup:
- Keep src/routes/(app)/ only when the product needs authenticated app routes.
- Remove showcase routes such as editor, flow/graph, 3D, assistant, billing, or admin when they are not part of the product.
- Remove the components gallery route (`src/routes/components/`) if not needed as a reference in production.
- Remove matching tests when routes are removed, then add product-specific smoke tests.
- Keep src/lib/components/ui as reusable primitives.
- Keep src/lib/components/landing only if the product needs landing sections.
- Keep src/lib/components/mist only if the Product Plate marketing sections are still useful; otherwise delete or replace them.
- After cleanup, every sidebar item, nav link, CTA, sitemap URL, and test route should point to a real product surface.

Documentation and handoff:
- Add a short "Chosen stack" section to README.md and AGENTS.md.
- Add a short "Core product loop" section to README.md and AGENTS.md.
- Document required local and production env vars.
- Document what was removed from the starter.
- Document the generated logo/assets and where to replace them later.
- Provide the next 3 setup commands for the selected stack.
- Leave TODOs only for real product decisions, not generic template cleanup.

Verification:
- Run the smallest relevant tests first.
- Run bun run check.
- Run bun run test:unit when source logic changed.
- Run bun run test:e2e when routes, auth, onboarding, billing, or public pages changed.
- Run bun run build before final handoff.
- If a command fails because an external service key is missing, document the exact missing key and leave the code in a locally verifiable state.

Final response:
- Summarize changed files.
- List the selected stack.
- List the implemented core product loop.
- List removed template surfaces.
- List verification commands and results.
- Give the next steps for local env, provider dashboard setup, logo replacement if desired, and deployment.
```

## Current Template Defaults

- Frontend: SvelteKit, Svelte 5, Tailwind CSS v4, shadcn-svelte.
- Backend: Convex in `src/convex`.
- Auth: Better Auth.
- Billing: Autumn backed by Stripe.
- AI: Vercel AI SDK chat route and assistant UI.
- Package manager: bun.
- Deployment: Cloudflare Pages plus Convex.
- Public preview: `/auth/demo` creates a fresh disposable demo account and should usually be deleted during kickstart.
- Inactive options: `_template_options` contains scaffold material for alternate billing and database choices.

## Folder Map for Agents

```text
src/routes/                 SvelteKit routes and API handlers
src/routes/components/      Showcase component gallery routes
src/routes/(app)/           Authenticated app routes and app shell
src/routes/auth/            Auth screens and public demo entrypoint
src/lib/constants.ts        App identity, SEO, PWA, and shared metadata defaults
src/lib/components/ui/      shadcn-svelte primitives
src/lib/components/ai/      AI assistant components
src/lib/components/landing/ Reusable landing sections
src/lib/components/mist/    Product Plate marketing sections
src/convex/                 Convex schema, auth, billing, functions
_template_options/          Inactive provider/database scaffolds
docs/                       Integration docs
```

## Kickstart quality checklist

A successful kickstart should leave the clone with:

- A real product name, tagline, metadata, favicon/logo, PWA colors, and OG image/placeholder.
- One selected stack path with unselected providers removed or clearly docs-only.
- One product-specific primary workflow that works end-to-end.
- Routes, nav, CTAs, sitemap, and tests that point to real product surfaces.
- No public Product Plate demo entry unless explicitly kept.
- No showcase dashboards, fake metrics, or starter-only component galleries in the user-facing app unless explicitly kept.
- A README/AGENTS handoff that tells the next agent what product was selected, what was implemented, what was removed, and how to continue.
