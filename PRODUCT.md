# Product Plate

## Register

brand

## Users

Indie hackers and early-stage founders who want to start a production-minded SaaS product without rebuilding authentication, billing, data, AI, and interface foundations.

## Product Purpose

Product Plate is a public SvelteKit starter with a connected frontend, Convex backend, authentication, billing, AI patterns, and reusable product UI. It helps teams turn a product idea into a credible working SaaS without repeating the initial setup.

## Template Kickstart

- `START_HERE.md` is the default handoff prompt for turning the starter into a specific product.
- The hosted `/auth/demo` entrypoint creates a fresh disposable demo account per visitor and should be deleted or replaced during kickstart.
- `_template_options` stores inactive scaffolds for alternate billing and data choices. The final app should keep one active stack and remove unused options.
- Public docs, blog, changelog, legal pages, component gallery, theme builder, workspace, developer, and admin screens are starter surfaces. Kickstart should keep only the ones that support the selected product.
- Default stack: SvelteKit, Svelte 5, Convex, Better Auth, Autumn, Tailwind CSS v4, shadcn-svelte, Bun, Cloudflare Pages.
- Current platform patterns include organizations, invites, entitlements, notifications, hashed API keys, request IDs, security headers, and optional request logging.

## Brand Personality

Practical, composed, and direct. The product should support serious work, be easy to start, and remain neutral enough to adapt to a new brand. A focused orange signal color marks Product Plate guidance without taking over the product UI.

## Anti-references

- Generic AI-tool marketing with purple gradients, glowing orbs, and glassmorphism.
- Over-animated component galleries that obscure the actual product foundation.
- Empty template claims that are not demonstrated by real routes or working code.
- Editorial or luxury styling that makes a developer starter feel precious.

## Design Principles

- Show the working product, not abstract promises.
- Lead public pages with real route screenshots instead of fabricated interface mockups.
- Keep the default system neutral and adaptable while giving Product Plate a recognizable voice.
- Prefer useful composition over decorative component volume.
- Make the path from evaluation to local development obvious.
- Treat accessibility, responsive behavior, and reduced motion as defaults.

## Accessibility & Inclusion

Target WCAG 2.2 AA. Maintain visible keyboard focus, semantic landmarks, sufficient contrast, reduced-motion support, descriptive labels, and usable layouts from small phones through wide desktop screens.
