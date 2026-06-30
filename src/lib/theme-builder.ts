export const themeStyles = ['operational', 'compact', 'editorial', 'console'] as const;
export const baseColors = ['neutral', 'zinc', 'stone', 'mauve', 'olive', 'mist'] as const;
export const accentColors = [
	'orange',
	'amber',
	'blue',
	'emerald',
	'rose',
	'violet',
	'teal',
	'cyan'
] as const;
export const chartColors = ['orange', 'blue', 'emerald', 'violet', 'rose', 'cyan'] as const;
export const radii = ['none', 'small', 'default', 'medium', 'large'] as const;
export const fonts = [
	'inter',
	'geist',
	'figtree',
	'system',
	'jetbrains-mono',
	'source-sans'
] as const;
export const menuAccents = ['subtle', 'bold'] as const;
export const menuColors = ['default', 'inverted', 'translucent'] as const;
export const themePresetStorageKey = 'product-plate-theme-preset';
export const themePresetChangeEvent = 'product-plate-theme-preset-change';

export interface ThemePreset {
	style: (typeof themeStyles)[number];
	baseColor: (typeof baseColors)[number];
	accentColor: (typeof accentColors)[number];
	chartColor: (typeof chartColors)[number];
	radius: (typeof radii)[number];
	font: (typeof fonts)[number];
	headingFont: (typeof fonts)[number] | 'inherit';
	menuAccent: (typeof menuAccents)[number];
	menuColor: (typeof menuColors)[number];
}

export const defaultThemePreset: ThemePreset = {
	style: 'operational',
	baseColor: 'neutral',
	accentColor: 'orange',
	chartColor: 'orange',
	radius: 'default',
	font: 'inter',
	headingFont: 'inherit',
	menuAccent: 'subtle',
	menuColor: 'default'
};

type OptionRecord<T extends readonly string[]> = Record<
	T[number],
	{ name: string; color?: string; value?: string }
>;

export const themeStyleMeta: OptionRecord<typeof themeStyles> = {
	operational: { name: 'Operational' },
	compact: { name: 'Compact' },
	editorial: { name: 'Editorial' },
	console: { name: 'Console' }
};

export const baseColorMeta: OptionRecord<typeof baseColors> = {
	neutral: { name: 'Neutral', color: '#737373' },
	zinc: { name: 'Zinc', color: '#71717a' },
	stone: { name: 'Stone', color: '#78716c' },
	mauve: { name: 'Mauve', color: '#79697b' },
	olive: { name: 'Olive', color: '#7c7c67' },
	mist: { name: 'Mist', color: '#67787c' }
};

export const accentColorMeta: OptionRecord<typeof accentColors> = {
	orange: { name: 'Orange', color: '#ff6900' },
	amber: { name: 'Amber', color: '#f59e0b' },
	blue: { name: 'Blue', color: '#2b7fff' },
	emerald: { name: 'Emerald', color: '#00bc7d' },
	rose: { name: 'Rose', color: '#ff2056' },
	violet: { name: 'Violet', color: '#8e51ff' },
	teal: { name: 'Teal', color: '#00bba7' },
	cyan: { name: 'Cyan', color: '#00b8db' }
};

export const chartColorMeta: OptionRecord<typeof chartColors> = {
	orange: { name: 'Orange', color: '#f97316' },
	blue: { name: 'Blue', color: '#3b82f6' },
	emerald: { name: 'Emerald', color: '#10b981' },
	violet: { name: 'Violet', color: '#8b5cf6' },
	rose: { name: 'Rose', color: '#f43f5e' },
	cyan: { name: 'Cyan', color: '#06b6d4' }
};

export const radiusMeta: OptionRecord<typeof radii> = {
	none: { name: 'None', value: '0rem' },
	small: { name: 'Small', value: '0.45rem' },
	default: { name: 'Default', value: '0.7rem' },
	medium: { name: 'Medium', value: '0.875rem' },
	large: { name: 'Large', value: '1.1rem' }
};

export const fontMeta: OptionRecord<typeof fonts> = {
	inter: { name: 'Inter', value: 'Inter, ui-sans-serif, system-ui, sans-serif' },
	geist: { name: 'Geist', value: 'Geist, ui-sans-serif, system-ui, sans-serif' },
	figtree: { name: 'Figtree', value: 'Figtree, ui-sans-serif, system-ui, sans-serif' },
	system: { name: 'System', value: 'ui-sans-serif, system-ui, sans-serif' },
	'jetbrains-mono': { name: 'JetBrains Mono', value: 'JetBrains Mono, ui-monospace, monospace' },
	'source-sans': {
		name: 'Source Sans 3',
		value: 'Source Sans 3, ui-sans-serif, system-ui, sans-serif'
	}
};

const fieldDefinitions = [
	{ key: 'style', values: themeStyles, bits: 4 },
	{ key: 'baseColor', values: baseColors, bits: 4 },
	{ key: 'accentColor', values: accentColors, bits: 5 },
	{ key: 'chartColor', values: chartColors, bits: 4 },
	{ key: 'radius', values: radii, bits: 4 },
	{ key: 'font', values: fonts, bits: 4 },
	{ key: 'headingFont', values: ['inherit', ...fonts] as const, bits: 4 },
	{ key: 'menuAccent', values: menuAccents, bits: 2 },
	{ key: 'menuColor', values: menuColors, bits: 2 }
] as const;

const base62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function toBase62(value: number) {
	if (value === 0) return '0';
	let current = value;
	let result = '';
	while (current > 0) {
		result = base62[current % 62] + result;
		current = Math.floor(current / 62);
	}
	return result;
}

function fromBase62(value: string) {
	let result = 0;
	for (const character of value) {
		const index = base62.indexOf(character);
		if (index === -1) return -1;
		result = result * 62 + index;
	}
	return result;
}

export function encodeThemePreset(config: ThemePreset) {
	let bits = 0;
	let offset = 0;
	for (const field of fieldDefinitions) {
		const value = config[field.key as keyof ThemePreset] as string;
		const index = (field.values as readonly string[]).indexOf(value);
		bits += Math.max(index, 0) * 2 ** offset;
		offset += field.bits;
	}

	return `p${toBase62(bits)}`;
}

export function decodeThemePreset(code: string): ThemePreset | null {
	if (!code.startsWith('p')) return null;
	const bits = fromBase62(code.slice(1));
	if (bits < 0) return null;
	const decoded: Record<string, string> = {};
	let offset = 0;

	for (const field of fieldDefinitions) {
		const index = Math.floor(bits / 2 ** offset) % 2 ** field.bits;
		decoded[field.key] = field.values[index] ?? field.values[0];
		offset += field.bits;
	}

	return { ...defaultThemePreset, ...decoded } as ThemePreset;
}

const baseOklch: Record<(typeof baseColors)[number], { hue: number; chroma: number }> = {
	neutral: { hue: 95, chroma: 0.006 },
	zinc: { hue: 285, chroma: 0.012 },
	stone: { hue: 60, chroma: 0.014 },
	mauve: { hue: 320, chroma: 0.02 },
	olive: { hue: 105, chroma: 0.018 },
	mist: { hue: 205, chroma: 0.018 }
};

const accentOklch: Record<(typeof accentColors)[number], { hue: number; chroma: number }> = {
	orange: { hue: 42, chroma: 0.19 },
	amber: { hue: 75, chroma: 0.17 },
	blue: { hue: 260, chroma: 0.2 },
	emerald: { hue: 155, chroma: 0.16 },
	rose: { hue: 20, chroma: 0.2 },
	violet: { hue: 305, chroma: 0.19 },
	teal: { hue: 185, chroma: 0.15 },
	cyan: { hue: 215, chroma: 0.16 }
};

const chartHueOffset = [0, 65, 120, 180, 245];
const styleVariables: Record<(typeof themeStyles)[number], Record<string, string>> = {
	operational: {
		'--pp-theme-density': '1',
		'--pp-theme-card-padding': '1rem',
		'--pp-theme-section-gap': '1rem',
		'--pp-theme-border-width': '1px'
	},
	compact: {
		'--pp-theme-density': '0.82',
		'--pp-theme-card-padding': '0.75rem',
		'--pp-theme-section-gap': '0.65rem',
		'--pp-theme-border-width': '1px'
	},
	editorial: {
		'--pp-theme-density': '1.18',
		'--pp-theme-card-padding': '1.35rem',
		'--pp-theme-section-gap': '1.35rem',
		'--pp-theme-border-width': '1px'
	},
	console: {
		'--pp-theme-density': '0.92',
		'--pp-theme-card-padding': '0.9rem',
		'--pp-theme-section-gap': '0.85rem',
		'--pp-theme-border-width': '1.5px'
	}
};

function oklch(lightness: number, chroma: number, hue: number, alpha?: string) {
	return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${Math.round(hue)}${alpha ? ` / ${alpha}` : ''})`;
}

export function getThemeVariables(config: ThemePreset) {
	const base = baseOklch[config.baseColor];
	const accent = accentOklch[config.accentColor];
	const chart = accentOklch[config.chartColor];
	const compact = config.style === 'compact';
	const darkSidebar = config.menuColor === 'inverted';
	const translucentSidebar = config.menuColor === 'translucent';

	return {
		light: {
			'--radius': radiusMeta[config.radius].value ?? '0.7rem',
			'--background': oklch(0.988, base.chroma / 2, base.hue),
			'--foreground': oklch(0.19, base.chroma, base.hue),
			'--card': oklch(0.998, base.chroma / 3, base.hue),
			'--card-foreground': oklch(0.19, base.chroma, base.hue),
			'--popover': oklch(0.998, base.chroma / 3, base.hue),
			'--popover-foreground': oklch(0.19, base.chroma, base.hue),
			'--primary': oklch(0.58, accent.chroma, accent.hue),
			'--primary-foreground': oklch(0.985, 0.006, accent.hue),
			'--secondary': oklch(compact ? 0.945 : 0.955, base.chroma, base.hue),
			'--secondary-foreground': oklch(0.22, base.chroma, base.hue),
			'--muted': oklch(compact ? 0.94 : 0.955, base.chroma, base.hue),
			'--muted-foreground': oklch(0.5, base.chroma + 0.002, base.hue),
			'--accent': oklch(
				0.94,
				config.menuAccent === 'bold' ? accent.chroma / 2 : base.chroma,
				accent.hue
			),
			'--accent-foreground': oklch(0.22, base.chroma, base.hue),
			'--destructive': oklch(0.577, 0.245, 27),
			'--border': oklch(0.89, base.chroma + 0.001, base.hue),
			'--input': oklch(0.89, base.chroma + 0.001, base.hue),
			'--ring': oklch(0.64, accent.chroma, accent.hue),
			'--signal': oklch(0.62, accent.chroma, accent.hue),
			'--signal-foreground': oklch(0.985, 0.006, accent.hue),
			'--signal-soft': oklch(0.88, accent.chroma / 2, accent.hue),
			'--sidebar': darkSidebar
				? oklch(0.2, base.chroma, base.hue)
				: translucentSidebar
					? oklch(0.985, base.chroma / 2, base.hue, '78%')
					: oklch(0.975, base.chroma / 1.5, base.hue),
			'--sidebar-foreground': darkSidebar
				? oklch(0.965, base.chroma, base.hue)
				: oklch(0.19, base.chroma, base.hue),
			'--sidebar-primary': oklch(0.58, accent.chroma, accent.hue),
			'--sidebar-primary-foreground': oklch(0.985, 0.006, accent.hue),
			'--sidebar-accent': oklch(
				0.94,
				config.menuAccent === 'bold' ? accent.chroma / 2 : base.chroma,
				accent.hue
			),
			'--sidebar-accent-foreground': oklch(0.22, base.chroma, base.hue),
			'--sidebar-border': oklch(0.89, base.chroma + 0.001, base.hue),
			'--sidebar-ring': oklch(0.64, accent.chroma, accent.hue)
		},
		dark: {
			'--background': oklch(0.16, base.chroma, base.hue),
			'--foreground': oklch(0.96, base.chroma / 1.5, base.hue),
			'--card': oklch(0.2, base.chroma + 0.001, base.hue),
			'--card-foreground': oklch(0.96, base.chroma / 1.5, base.hue),
			'--popover': oklch(0.2, base.chroma + 0.001, base.hue),
			'--popover-foreground': oklch(0.96, base.chroma / 1.5, base.hue),
			'--primary': oklch(0.72, accent.chroma, accent.hue),
			'--primary-foreground': oklch(0.17, accent.chroma / 6, accent.hue),
			'--secondary': oklch(0.25, base.chroma + 0.002, base.hue),
			'--secondary-foreground': oklch(0.96, base.chroma / 1.5, base.hue),
			'--muted': oklch(0.25, base.chroma + 0.002, base.hue),
			'--muted-foreground': oklch(0.7, base.chroma + 0.003, base.hue),
			'--accent': oklch(
				0.28,
				config.menuAccent === 'bold' ? accent.chroma / 2 : base.chroma + 0.003,
				accent.hue
			),
			'--accent-foreground': oklch(0.96, base.chroma / 1.5, base.hue),
			'--destructive': oklch(0.704, 0.191, 22),
			'--border': oklch(1, 0, 0, '10%'),
			'--input': oklch(1, 0, 0, '15%'),
			'--ring': oklch(0.72, accent.chroma, accent.hue),
			'--signal': oklch(0.72, accent.chroma, accent.hue),
			'--signal-foreground': oklch(0.17, accent.chroma / 6, accent.hue),
			'--signal-soft': oklch(0.34, accent.chroma / 2, accent.hue),
			'--sidebar': oklch(0.205, base.chroma, base.hue),
			'--sidebar-foreground': oklch(0.985, 0, 0),
			'--sidebar-primary': oklch(0.72, accent.chroma, accent.hue),
			'--sidebar-primary-foreground': oklch(0.17, accent.chroma / 6, accent.hue),
			'--sidebar-accent': oklch(
				0.269,
				config.menuAccent === 'bold' ? accent.chroma / 2 : 0,
				accent.hue
			),
			'--sidebar-accent-foreground': oklch(0.985, 0, 0),
			'--sidebar-border': oklch(1, 0, 0, '10%'),
			'--sidebar-ring': oklch(0.72, accent.chroma, accent.hue)
		},
		charts: Object.fromEntries(
			chartHueOffset.map((offset, index) => [
				`--chart-${index + 1}`,
				oklch(index === 0 ? 0.64 : 0.58 + index * 0.045, chart.chroma, chart.hue + offset)
			])
		),
		style: styleVariables[config.style]
	};
}

export function getThemeCss(config: ThemePreset) {
	const variables = getThemeVariables(config);
	const headingFont =
		config.headingFont === 'inherit'
			? fontMeta[config.font].value
			: fontMeta[config.headingFont].value;
	const light = {
		...variables.light,
		...variables.charts,
		...variables.style,
		'--pp-theme-font': fontMeta[config.font].value,
		'--pp-theme-heading-font': headingFont
	};
	const dark = {
		...variables.dark,
		...variables.charts,
		...variables.style,
		'--pp-theme-font': fontMeta[config.font].value,
		'--pp-theme-heading-font': headingFont
	};
	const lightLines = Object.entries(light).map(([key, value]) => `\t${key}: ${value};`);
	const darkLines = Object.entries(dark).map(([key, value]) => `\t${key}: ${value};`);

	return `:root {\n${lightLines.join('\n')}\n}\n\n.dark {\n${darkLines.join('\n')}\n}`;
}

export function getThemeRuntimeCss(config: ThemePreset) {
	return `${getThemeCss(config)}

body {
\tfont-family: var(--pp-theme-font);
}

h1,
h2,
h3,
.theme-heading {
\tfont-family: var(--pp-theme-heading-font);
}`;
}

export function getPreviewStyle(config: ThemePreset, scheme: 'light' | 'dark' = 'light') {
	const variables = getThemeVariables(config);
	const colorVariables = scheme === 'dark' ? variables.dark : variables.light;
	const headingFont =
		config.headingFont === 'inherit'
			? fontMeta[config.font].value
			: fontMeta[config.headingFont].value;

	return Object.entries({
		...colorVariables,
		...variables.charts,
		...variables.style,
		'--pp-theme-font': fontMeta[config.font].value,
		'--pp-theme-heading-font': headingFont
	})
		.map(([key, value]) => `${key}: ${value}`)
		.join('; ');
}

export function parseThemePreset(value: string | null | undefined) {
	if (!value) return null;
	return decodeThemePreset(value.trim().replace(/^--preset\s+/, ''));
}
