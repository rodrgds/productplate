# Theme Recipes

Use this file during Product Plate kickstart when the user chooses a visual style. The goal is to activate one coherent identity, not to keep multiple runtime themes.

## General rules

- Pick one theme path and implement it in `src/app.css`.
- Load any chosen font families in `src/app.html` or at the top of `src/app.css`.
- Update `APP_THEME_COLOR`, `APP_BACKGROUND_COLOR`, favicon, PWA icons, OG image, landing copy, and visible brand components to match the selected style.
- Keep the shadcn-svelte variable names (`--background`, `--foreground`, `--primary`, `--border`, `--ring`, etc.) so existing UI primitives keep working.
- Do not leave Product Plate colors or icons in the final product unless the user explicitly wants the original identity.

## Claude-inspired theme

Best for calm productivity apps, AI products, writing tools, planning tools, and products that should feel warm but serious.

Fonts:

- Sans: `Outfit`
- Mono: `Geist Mono`

CSS starting point:

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap');

:root {
	--radius: 0.75rem;
	--background: oklch(0.965 0.012 78);
	--foreground: oklch(0.22 0.025 64);
	--card: oklch(0.99 0.006 78);
	--card-foreground: var(--foreground);
	--popover: var(--card);
	--popover-foreground: var(--foreground);
	--primary: oklch(0.36 0.055 52);
	--primary-foreground: oklch(0.985 0.006 78);
	--secondary: oklch(0.91 0.018 78);
	--secondary-foreground: oklch(0.28 0.03 64);
	--muted: oklch(0.92 0.012 78);
	--muted-foreground: oklch(0.48 0.025 64);
	--accent: oklch(0.88 0.026 72);
	--accent-foreground: oklch(0.26 0.03 64);
	--destructive: oklch(0.58 0.18 28);
	--destructive-foreground: oklch(0.985 0.006 78);
	--border: oklch(0.84 0.014 78);
	--input: var(--border);
	--ring: oklch(0.52 0.06 52);
	--font-sans: 'Outfit', ui-sans-serif, system-ui, sans-serif;
	--font-mono: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

Use soft sand backgrounds, restrained borders, mostly text-led sections, and simple SVG marks.

## Zen theme

Best for reflective tools, learning apps, writing apps, personal dashboards, minimalist B2B tools, and products that should feel quiet and grounded.

Fonts:

- Sans: `Inter`
- Serif/display: `Playfair Display`
- Mono: `JetBrains Mono`

CSS starting point:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap');

:root {
	--radius: 0.85rem;
	--background: hsl(42 34% 96%);
	--foreground: hsl(32 24% 12%);
	--card: hsl(45 32% 98%);
	--card-foreground: var(--foreground);
	--popover: var(--card);
	--popover-foreground: var(--foreground);
	--primary: hsl(104 18% 28%);
	--primary-foreground: hsl(48 36% 96%);
	--secondary: hsl(39 28% 89%);
	--secondary-foreground: hsl(32 24% 18%);
	--muted: hsl(40 26% 91%);
	--muted-foreground: hsl(30 12% 42%);
	--accent: hsl(78 22% 84%);
	--accent-foreground: hsl(104 18% 20%);
	--destructive: hsl(8 70% 44%);
	--destructive-foreground: hsl(48 36% 96%);
	--border: hsl(38 22% 82%);
	--input: var(--border);
	--ring: hsl(104 18% 38%);
	--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
	--font-serif: 'Playfair Display', Georgia, serif;
	--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

Use quiet off-white surfaces, sage/olive primary actions, generous whitespace, and serif headings only where they add identity.

## shadcn-svelte default presets

Use this when the product should feel neutral, familiar, and easy to ship.

Recommended picks:

- `Slate`: best default for technical SaaS.
- `Stone`: warmer, good for creator/productivity tools.
- `Zinc`: neutral and dense, good for admin-heavy apps.
- `Neutral`: most plain, best when the product identity will be added later.
- `Gray`: acceptable, but usually less distinctive than Slate or Stone.

For default presets, keep Tailwind/shadcn variable names and replace only token values, radius, and fonts. Do not add a theme switcher unless the user asks for one.

## Custom variables

Ask for or infer:

- Background
- Foreground
- Primary
- Accent
- Sans font
- Display/serif font, if any
- Mono font
- Border radius
- Shadow intensity

Then document the choices in `PRODUCT.md` or `README.md` so future agents preserve the identity.
