# Visual Style & Themes Reference

This document provides style presets and configurations to adapt the Product Plate's visual identity. Use these as a reference to copy and paste or customize the theme configuration in `src/app.css` and `src/app.html`.

Use this file during kickstart to activate one coherent identity, not to keep multiple runtime themes. Update `src/app.css`, `src/app.html`, `APP_THEME_COLOR`, `APP_BACKGROUND_COLOR`, favicon/PWA/OG assets, and visible brand components to match the selected style.

---

## 1. Claude Theme (Outfit + Geist Mono)

A warm, clean aesthetic modeled after Anthropic's Claude interfaces. Uses OKLCH colors, Outfit sans font, and custom shadows/radius.

### CSS Variables (`src/app.css`)

```css
@import 'tailwindcss';

@custom-variant dark (&:is(.dark *));

/* Font Import at the top of app.css */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Geist+Mono:wght@100..900&display=swap');

:root {
	--background: oklch(0.9818 0.0054 95.0986);
	--foreground: oklch(0.3438 0.0269 95.7226);
	--card: oklch(0.9665 0.0067 97.3521);
	--card-foreground: oklch(0.1908 0.002 106.5859);
	--popover: oklch(1 0 0);
	--popover-foreground: oklch(0.2671 0.0196 98.939);
	--primary: oklch(0.6171 0.1375 39.0427);
	--primary-foreground: oklch(1 0 0);
	--secondary: oklch(0.9245 0.0138 92.9892);
	--secondary-foreground: oklch(0.4334 0.0177 98.6048);
	--muted: oklch(0.9341 0.0153 90.239);
	--muted-foreground: oklch(0.5341 0.0078 97.4503);
	--accent: oklch(0.9245 0.0138 92.9892);
	--accent-foreground: oklch(0.2671 0.0196 98.939);
	--destructive: oklch(0.1908 0.002 106.5859);
	--destructive-foreground: oklch(1 0 0);
	--border: oklch(0.8847 0.0069 97.3627);
	--input: oklch(0.7621 0.0156 98.3528);
	--ring: oklch(0.6171 0.1375 39.0427);
	--chart-1: oklch(0.5583 0.1276 42.9956);
	--chart-2: oklch(0.6898 0.1581 290.4107);
	--chart-3: oklch(0.8816 0.0276 93.128);
	--chart-4: oklch(0.8822 0.0403 298.1792);
	--chart-5: oklch(0.5608 0.1348 42.0584);
	--sidebar: oklch(0.9663 0.008 98.8792);
	--sidebar-foreground: oklch(0.359 0.0051 106.6524);
	--sidebar-primary: oklch(0.6171 0.1375 39.0427);
	--sidebar-primary-foreground: oklch(0.9881 0 0);
	--sidebar-accent: oklch(0.9245 0.0138 92.9892);
	--sidebar-accent-foreground: oklch(0.325 0 0);
	--sidebar-border: oklch(0.9401 0 0);
	--sidebar-ring: oklch(0.7731 0 0);

	--font-sans: 'Outfit', sans-serif;
	--font-mono: 'Geist Mono', monospace;
	--radius: 1rem;
}

.dark {
	--background: oklch(0.2679 0.0036 106.6427);
	--foreground: oklch(0.9576 0.0027 106.4494);
	--card: oklch(0.2928 0.0018 106.5092);
	--card-foreground: oklch(0.9818 0.0054 95.0986);
	--popover: oklch(0.3085 0.0035 106.6039);
	--popover-foreground: oklch(0.9211 0.004 106.4781);
	--primary: oklch(0.6724 0.1308 38.7559);
	--primary-foreground: oklch(0.1908 0.002 106.5859);
	--secondary: oklch(0.9818 0.0054 95.0986);
	--secondary-foreground: oklch(0.3085 0.0035 106.6039);
	--muted: oklch(0.2213 0.0038 106.707);
	--muted-foreground: oklch(0.7713 0.0169 99.0657);
	--accent: oklch(0.213 0.0078 95.4245);
	--accent-foreground: oklch(0.9663 0.008 98.8792);
	--destructive: oklch(0.6368 0.2078 25.3313);
	--destructive-foreground: oklch(1 0 0);
	--border: oklch(0.3618 0.0101 106.8928);
	--input: oklch(0.4336 0.0113 100.2195);
	--ring: oklch(0.6724 0.1308 38.7559);
	--chart-1: oklch(0.5583 0.1276 42.9956);
	--chart-2: oklch(0.6898 0.1581 290.4107);
	--chart-3: oklch(0.213 0.0078 95.4245);
	--chart-4: oklch(0.3074 0.0516 289.323);
	--chart-5: oklch(0.5608 0.1348 42.0584);
	--sidebar: oklch(0.2357 0.0024 67.7077);
	--sidebar-foreground: oklch(0.8074 0.0142 93.0137);
	--sidebar-primary: oklch(0.325 0 0);
	--sidebar-primary-foreground: oklch(0.9881 0 0);
	--sidebar-accent: oklch(0.168 0.002 106.6177);
	--sidebar-accent-foreground: oklch(0.8074 0.0142 93.0137);
	--sidebar-border: oklch(0.9401 0 0);
	--sidebar-ring: oklch(0.7731 0 0);
}
```

---

## 2. Zen Inspired Theme (Inter + Playfair Display + JetBrains Mono)

A minimalist, tactile, and natural theme inspired by Wabi-Sabi style. Muted earth tones, a serif accent font for display headings, and sharper radiuses.

### CSS Variables (`src/app.css`)

```css
@import 'tailwindcss';

@custom-variant dark (&:is(.dark *));

/* Font Imports at the top of app.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

:root {
	--background: hsl(42.3529 27.8689% 88.0392%);
	--foreground: hsl(0 0% 11.7647%);
	--card: hsl(41.25 42.1053% 92.549%);
	--card-foreground: hsl(0 0% 11.7647%);
	--popover: hsl(41.25 42.1053% 92.549%);
	--popover-foreground: hsl(0 0% 11.7647%);
	--primary: hsl(0 0% 18.0392%);
	--primary-foreground: hsl(52 23.0769% 87.2549%);
	--secondary: hsl(42 20.4082% 80.7843%);
	--secondary-foreground: hsl(0 0% 18.0392%);
	--muted: hsl(41.7391 19.3277% 76.6667%);
	--muted-foreground: hsl(40 6.8182% 34.5098%);
	--accent: hsl(52 23.0769% 87.2549%);
	--accent-foreground: hsl(0 0% 18.0392%);
	--destructive: hsl(0 72.2222% 50.5882%);
	--destructive-foreground: hsl(0 0% 100%);
	--border: hsl(41.7391 20.354% 77.8431%);
	--input: hsl(41.7391 20.354% 77.8431%);
	--ring: hsl(0 0% 18.0392%);
	--chart-1: hsl(11.1377 86.5285% 62.1569%);
	--chart-2: hsl(0 0% 11.7647%);
	--chart-3: hsl(40 6.8182% 34.5098%);
	--chart-4: hsl(38.4 12.5628% 60.9804%);
	--chart-5: hsl(41.7391 19.3277% 76.6667%);
	--sidebar: hsl(42 26.3158% 85.098%);
	--sidebar-foreground: hsl(0 0% 11.7647%);
	--sidebar-primary: hsl(0 0% 18.0392%);
	--sidebar-primary-foreground: hsl(52 23.0769% 87.2549%);
	--sidebar-accent: hsl(52 23.0769% 87.2549%);
	--sidebar-accent-foreground: hsl(0 0% 18.0392%);
	--sidebar-border: hsl(41.7391 20.354% 77.8431%);
	--sidebar-ring: hsl(0 0% 18.0392%);

	--font-sans: 'Inter', sans-serif;
	--font-serif: 'Playfair Display', serif;
	--font-mono: 'JetBrains Mono', monospace;
	--radius: 0.5rem;
}

.dark {
	--background: hsl(0 0% 7.8431%);
	--foreground: hsl(38.5714 23.3333% 88.2353%);
	--card: hsl(0 0% 10.9804%);
	--card-foreground: hsl(38.5714 23.3333% 88.2353%);
	--popover: hsl(0 0% 10.9804%);
	--popover-foreground: hsl(38.5714 23.3333% 88.2353%);
	--primary: hsl(52.9412 15.5963% 78.6275%);
	--primary-foreground: hsl(0 0% 21.1765%);
	--secondary: hsl(0 0% 13.3333%);
	--secondary-foreground: hsl(52.9412 15.5963% 78.6275%);
	--muted: hsl(0 0% 16.4706%);
	--muted-foreground: hsl(38.1818 4.6414% 53.5294%);
	--accent: hsl(0 0% 21.1765%);
	--accent-foreground: hsl(52.9412 15.5963% 78.6275%);
	--destructive: hsl(0 84.2365% 60.1961%);
	--destructive-foreground: hsl(0 0% 100%);
	--border: hsl(0 0% 17.2549%);
	--input: hsl(0 0% 17.2549%);
	--ring: hsl(52.9412 15.5963% 78.6275%);
	--chart-1: hsl(11.1377 86.5285% 62.1569%);
	--chart-2: hsl(33.913 23.2323% 80.5882%);
	--chart-3: hsl(38.1818 4.6414% 53.5294%);
	--chart-4: hsl(40 3.3708% 34.902%);
	--chart-5: hsl(0 0% 23.1373%);
	--sidebar: hsl(0 0% 6.2745%);
	--sidebar-foreground: hsl(38.5714 23.3333% 88.2353%);
	--sidebar-primary: hsl(52.9412 15.5963% 78.6275%);
	--sidebar-primary-foreground: hsl(0 0% 21.1765%);
	--sidebar-accent: hsl(0 0% 21.1765%);
	--sidebar-accent-foreground: hsl(52.9412 15.5963% 78.6275%);
	--sidebar-border: hsl(0 0% 17.2549%);
	--sidebar-ring: hsl(52.9412 15.5963% 78.6275%);
}
```

---

## 3. shadcn-svelte Standard Base Colors (Neutral, Stone, Zinc, Gray, Slate)

For clean, neutral backgrounds using OKLCH values in light and dark mode.

### Neutral

- **Light**:
  ```css
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --border: oklch(0.922 0 0);
  ```
- **Dark**:
  ```css
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --border: oklch(1 0 0 / 10%);
  ```

### Stone

- **Light**:
  ```css
  --background: oklch(1 0 0);
  --foreground: oklch(0.147 0.004 49.25);
  --primary: oklch(0.216 0.006 56.043);
  --primary-foreground: oklch(0.985 0.001 106.423);
  --border: oklch(0.923 0.003 48.717);
  ```
- **Dark**:
  ```css
  --background: oklch(0.147 0.004 49.25);
  --foreground: oklch(0.985 0.001 106.423);
  --primary: oklch(0.923 0.003 48.717);
  --primary-foreground: oklch(0.216 0.006 56.043);
  --border: oklch(1 0 0 / 10%);
  ```

### Zinc

- **Light**:
  ```css
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  --border: oklch(0.92 0.004 286.32);
  ```
- **Dark**:
  ```css
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.92 0.004 286.32);
  --primary-foreground: oklch(0.21 0.006 285.885);
  --border: oklch(1 0 0 / 10%);
  ```

### Gray

- **Light**:
  ```css
  --background: oklch(1 0 0);
  --foreground: oklch(0.13 0.028 261.692);
  --primary: oklch(0.21 0.034 264.665);
  --primary-foreground: oklch(0.985 0.002 247.839);
  --border: oklch(0.928 0.006 264.531);
  ```
- **Dark**:
  ```css
  --background: oklch(0.13 0.028 261.692);
  --foreground: oklch(0.985 0.002 247.839);
  --primary: oklch(0.928 0.006 264.531);
  --primary-foreground: oklch(0.21 0.034 264.665);
  --border: oklch(1 0 0 / 10%);
  ```

### Slate

- **Light**:
  ```css
  --background: oklch(1 0 0);
  --foreground: oklch(0.129 0.042 264.695);
  --primary: oklch(0.208 0.042 265.755);
  --primary-foreground: oklch(0.984 0.003 247.858);
  --border: oklch(0.929 0.013 255.508);
  ```
- **Dark**:
  ```css
  --background: oklch(0.129 0.042 264.695);
  --foreground: oklch(0.984 0.003 247.858);
  --primary: oklch(0.929 0.013 255.508);
  --primary-foreground: oklch(0.208 0.042 265.755);
  --border: oklch(1 0 0 / 10%);
  ```

---

## 4. How to Apply Visual Theme Adaptations in SvelteKit + Tailwind v4

### Step A: Import Fonts

Add `@import url(...)` at the **top** of `src/app.css` or insert a `<link>` in `src/app.html` `<head>`.
For example, to load _Inter_ and _Playfair Display_:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
```

### Step B: Map Theme Variables in `@theme inline`

In `src/app.css`, look for `@theme inline`. Map the custom properties so Tailwind utilities resolve them:

```css
@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-card: var(--card);
	--color-card-foreground: var(--card-foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-accent: var(--accent);
	--color-accent-foreground: var(--accent-foreground);
	--color-destructive: var(--destructive);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);

	/* Radius sizing dynamic mapping */
	--radius-sm: calc(var(--radius) - 4px);
	--radius-md: calc(var(--radius) - 2px);
	--radius-lg: var(--radius);
	--radius-xl: calc(var(--radius) + 4px);

	/* Font mapping */
	--font-sans: var(--font-sans);
	--font-mono: var(--font-mono);
	--font-serif: var(--font-serif);
}
```

### Step C: Reference in `@layer base`

Bind the default fonts to the HTML markup:

```css
@layer base {
	body {
		@apply bg-background text-foreground;
		font-family: var(--font-sans);
	}

	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		/* Optional: Use serif for headings (Zen) */
		font-family: var(--font-serif, var(--font-sans));
	}
}
```
