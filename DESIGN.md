---
name: Product Plate
description: A quiet, production-minded foundation for modern SaaS products.
colors:
  ink: 'oklch(0.2 0.006 95)'
  canvas: 'oklch(0.988 0.003 95)'
  surface: 'oklch(0.998 0.002 95)'
  muted: 'oklch(0.955 0.005 95)'
  muted-ink: 'oklch(0.5 0.008 95)'
  border: 'oklch(0.89 0.007 95)'
  signal: 'oklch(0.62 0.19 42)'
  destructive: 'oklch(0.577 0.245 27.325)'
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: 'clamp(3rem, 7vw, 4.5rem)'
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: '-0.045em'
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: 'clamp(2.25rem, 5vw, 3rem)'
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: '-0.03em'
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.65
rounded:
  sm: '6px'
  md: '9px'
  lg: '11px'
  xl: '16px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '16px'
  lg: '24px'
  xl: '48px'
components:
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.canvas}'
    rounded: '{rounded.md}'
    height: '36px'
    padding: '0 10px'
  button-outline:
    backgroundColor: '{colors.canvas}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    height: '36px'
    padding: '0 10px'
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    padding: '24px'
---

# Design System: Product Plate

## Overview

**Design direction: "A focused product starter"**

Product Plate should feel capable, calm, and ready to adapt. The system uses warm-tinted neutrals, compact controls, precise borders, and varied section spacing. Product screenshots and working interface compositions show what the starter includes.

It explicitly rejects generic AI-tool marketing with purple gradients, glowing orbs, and glassmorphism; over-animated component galleries; empty template claims; and editorial or luxury styling. Minimal does not mean empty. Every section must demonstrate a useful product capability.

**Key Characteristics:**

- Warm neutral canvas with high-contrast ink and a focused orange signal color
- Flat surfaces separated by borders and restrained tonal shifts
- Large, tightly tracked headlines with readable supporting copy
- Real interface compositions instead of abstract decoration
- Responsive by default with reduced-motion support

## Colors

The palette is restrained and warm. Ink is used decisively; tonal neutrals provide structure without competing with a future product brand.

### Primary

- **Ink:** The primary action, headline, and strongest navigation color.
- **Signal Orange:** Product Plate guidance, section markers, and the kickstart story. Keep it focused so downstream products can replace it easily.

### Neutral

- **Warm Canvas:** The page background and open breathing space.
- **Clean Surface:** Cards, popovers, and product preview surfaces.
- **Soft Neutral:** Muted sections, active navigation, and secondary controls.
- **Pencil Gray:** Secondary copy and interface metadata.
- **Border:** Borders, dividers, and input outlines.

**The Ten Percent Rule.** Strong ink-filled surfaces should occupy less than ten percent of a typical screen. Their rarity preserves hierarchy.

## Typography

**Display Font:** Native system sans
**Body Font:** Native system sans

**Character:** Direct, quick to render, and deliberately adaptable. Product Plate keeps the existing system-font direction instead of adding a branded webfont that downstream products must remove.

### Hierarchy

- **Display** (600, fluid 48–72px, 0.98): Landing hero only.
- **Headline** (600, fluid 36–48px, 1.05): Major section headings.
- **Title** (600, 20–24px, 1.2): Product panels and grouped content.
- **Body** (400, 16–18px, 1.65): Explanations, capped near 70 characters.
- **Label** (500–600, 12–14px): Navigation, badges, controls, and metadata.

**The One Family Rule.** Hierarchy comes from scale, weight, and tracking, not an ornamental second typeface.

## Elevation

The system is flat by default. Borders and tonal layers establish structure; soft ambient shadows appear only on elevated previews, cards that overlap another surface, and floating overlays.

### Shadow Vocabulary

- **Surface:** `0 1px 2px color-mix(in oklch, var(--foreground) 5%, transparent)` for ordinary cards.
- **Preview:** `0 24px 50px color-mix(in oklch, var(--foreground) 5%, transparent)` for the hero product window.

**The Flat-By-Default Rule.** If every card casts a shadow, remove the shadows and restore hierarchy with spacing and borders.

## Components

### Buttons

- **Shape:** Compact and gently rounded (9px radius).
- **Primary:** Ink with Warm Canvas text; use for one dominant action per group.
- **Hover / Focus:** Subtle tonal change and a visible three-pixel focus ring. No glow.
- **Secondary / Ghost:** Neutral surfaces and existing shadcn-svelte variants.

### Chips

- **Style:** Small badges with a full border or soft neutral fill.
- **State:** Badges describe state or category and never replace a primary action.

### Cards / Containers

- **Corner Style:** Gently rounded (11px radius, 16px for signature containers).
- **Background:** Clean Surface on Warm Canvas.
- **Shadow Strategy:** Flat or Surface shadow; Preview shadow only for product demonstrations.
- **Border:** One-pixel Joinery Line.
- **Internal Padding:** 24px by default, 32–48px for feature compositions.

### Inputs / Fields

- **Style:** Clean Surface, one-pixel outline, compact control height.
- **Focus:** Visible ring using the semantic ring token.
- **Error / Disabled:** Semantic destructive state and clear opacity change without removing labels.

### Navigation

Use short, sentence-case labels and muted default text. Active items use Soft Bench with Workbench Ink. Desktop marketing navigation stays horizontal; mobile prioritizes brand and the primary action.

### Product Preview

Product demonstrations use a browser-like outer frame and real product UI patterns. They must explain a shipped route or capability, never display meaningless placeholder geometry.

## Do's and Don'ts

### Do:

- **Do** show working routes, data tables, charts, forms, and app navigation.
- **Do** use warm-tinted OKLCH neutrals and semantic design tokens.
- **Do** vary section density so the page has rhythm.
- **Do** preserve visible focus, semantic landmarks, and reduced-motion behavior.
- **Do** compose existing shadcn-svelte primitives before creating new base controls.

### Don't:

- **Don't** use generic AI-tool marketing with purple gradients, glowing orbs, and glassmorphism.
- **Don't** build over-animated component galleries that obscure the actual product foundation.
- **Don't** make empty template claims that are not demonstrated by real routes or working code.
- **Don't** use editorial or luxury styling that makes a developer starter feel precious.
- **Don't** use gradient text, decorative glass cards, repeated icon-card grids, or colored side-stripe borders.
- **Don't** add motion that ignores `prefers-reduced-motion`.
