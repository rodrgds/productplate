---
name: packages
description: 'Common good packages to use when facing a problem in this SvelteKit boilerplate. Check this skill when you want a package for a task: these are the official or project-recommended choices and are mostly maintained. If the package you need is not listed here, find a good, maintained package with active releases, clear docs, TypeScript support, and SvelteKit compatibility.'
---

# Package Choices

Use `bun` for every package operation.

## Current Project Defaults

- App framework: `@sveltejs/kit`, `svelte`
- Backend and realtime data: `convex`, `convex-svelte`
- Auth: `better-auth`, `@convex-dev/better-auth`
- UI: `bits-ui`, `shadcn-svelte` components in `src/lib/components/ui`
- Styling: `tailwindcss`, `@tailwindcss/vite`, `tailwind-merge`, `tailwind-variants`
- Icons: `@lucide/svelte`
- Forms: `sveltekit-superforms`, `formsnap`, `zod`
- Testing: `vitest`, `@testing-library/svelte`, `@testing-library/jest-dom`, `playwright`

## Recommended By Problem

- Rich text editing: `prosekit` with `@prosekit/svelte`
- Node editors and diagrams: `@xyflow/svelte`
- 3D scenes: `@threlte/core`, `three`
- AI chat and agents: `ai`, `@ai-sdk/svelte`, provider packages such as `@ai-sdk/openai`
- Confetti and lightweight celebration: `@neoconfetti/svelte`
- Charts: `layerchart`
- Tables: `@tanstack/table-core` or `@tanstack/svelte-table`
- Virtual lists: `@tanstack/svelte-virtual` or `virtua`
- Content/Markdown: `mdsvex`, `svelte-exmarkdown`, `carta-md`
- Uploads: Convex storage first; use `@uppy/svelte` for advanced upload flows
- Maps: `svelte-maplibre`
- SEO: `svelte-meta-tags` or `super-sitemap`
- Error monitoring: `@sentry/sveltekit`
- i18n: `@inlang/paraglide-js`

## Selection Rules

Prefer packages that are actively maintained, documented, typed, compatible with Svelte 5/SvelteKit 2, and already used by the project. Avoid adding a second package for a problem already solved by an installed dependency unless there is a concrete missing capability.
