<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import CheckIcon from '@lucide/svelte/icons/check';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import Dice5Icon from '@lucide/svelte/icons/dice-5';
	import MonitorIcon from '@lucide/svelte/icons/monitor';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import SunIcon from '@lucide/svelte/icons/sun';
	import { mode, resetMode, setMode, userPrefersMode } from 'mode-watcher';
	import { onMount } from 'svelte';
	import LandingNav from '$lib/components/landing/landing-nav.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { APP_NAME } from '$lib/constants.js';
	import {
		accentColorMeta,
		accentColors,
		baseColorMeta,
		baseColors,
		chartColorMeta,
		chartColors,
		decodeThemePreset,
		defaultThemePreset,
		encodeThemePreset,
		fontMeta,
		fonts,
		getPreviewStyle,
		getThemeCss,
		menuAccents,
		menuColors,
		parseThemePreset,
		radii,
		radiusMeta,
		themePresetChangeEvent,
		themePresetStorageKey,
		themeStyleMeta,
		themeStyles,
		type ThemePreset
	} from '$lib/theme-builder.js';

	const headingFonts = ['inherit', ...fonts] as const;

	const styleDetails: Record<ThemePreset['style'], string> = {
		operational: 'Balanced spacing and app-first rhythm.',
		default: 'The classic shadcn-style baseline.',
		'new-york': 'Sharper controls and denser app chrome.',
		compact: 'Denser controls, shorter cards, tighter data views.',
		editorial: 'More breathing room and larger content sections.',
		soft: 'Rounder surfaces with a calmer card treatment.',
		sharp: 'Crisp borders, flatter cards, stronger structure.',
		mono: 'Technical typography without the console shell.',
		console: 'Sharper, technical, command-center styling.',
		spacious: 'Large panels and relaxed product marketing rhythm.'
	};

	const menuColorLabels: Record<ThemePreset['menuColor'], string> = {
		default: 'Default',
		inverted: 'Inverted',
		translucent: 'Translucent'
	};

	const modeOptions = [
		{ label: 'Light', value: 'light', icon: SunIcon },
		{ label: 'Dark', value: 'dark', icon: MoonIcon },
		{ label: 'System', value: 'system', icon: MonitorIcon }
	] as const;

	let config = $state<ThemePreset>({ ...defaultThemePreset });
	let copied = $state<'css' | 'preset' | 'share' | null>(null);
	let copyError = $state('');
	let presetInput = $state('');
	let presetError = $state('');
	let hasLoadedStoredTheme = $state(false);

	let presetCode = $derived(encodeThemePreset(config));
	let cssCode = $derived(getThemeCss(config));
	let previewScheme: 'light' | 'dark' = $derived(mode.current === 'dark' ? 'dark' : 'light');
	let previewStyle = $derived(
		`${getPreviewStyle(config, previewScheme)}; color-scheme: ${previewScheme}; font-family: var(--pp-theme-font);`
	);
	let shareUrl = $derived(
		browser ? `${location.origin}${resolve('/theme-builder')}?preset=${presetCode}` : ''
	);

	function setConfig<Key extends keyof ThemePreset>(key: Key, value: ThemePreset[Key]) {
		config[key] = value;
	}

	function randomItem<Values extends readonly string[]>(values: Values): Values[number] {
		return values[Math.floor(Math.random() * values.length)]!;
	}

	function randomize() {
		config = {
			style: randomItem(themeStyles),
			baseColor: randomItem(baseColors),
			accentColor: randomItem(accentColors),
			chartColor: randomItem(chartColors),
			radius: randomItem(radii),
			font: randomItem(fonts),
			headingFont: randomItem(headingFonts),
			menuAccent: randomItem(menuAccents),
			menuColor: randomItem(menuColors)
		};
	}

	function reset() {
		config = { ...defaultThemePreset };
		presetInput = '';
		presetError = '';
	}

	function applyPreset() {
		const decoded = decodeThemePreset(presetInput.trim().replace(/^--preset\s+/, ''));
		if (!decoded) {
			presetError = 'Paste a Product Plate preset code like p4Jb2.';
			return;
		}

		config = decoded;
		presetError = '';
	}

	function copyWithSelection(value: string) {
		if (!browser) return false;

		const textarea = document.createElement('textarea');
		textarea.value = value;
		textarea.setAttribute('readonly', '');
		textarea.style.position = 'fixed';
		textarea.style.inset = '0 auto auto -9999px';
		textarea.style.opacity = '0';
		document.body.appendChild(textarea);
		textarea.focus({ preventScroll: true });
		textarea.select();
		textarea.setSelectionRange(0, value.length);

		try {
			return document.execCommand('copy');
		} finally {
			textarea.remove();
		}
	}

	async function writeClipboard(value: string) {
		if (copyWithSelection(value)) return true;
		if (!navigator.clipboard?.writeText) return false;

		try {
			await navigator.clipboard.writeText(value);
			return true;
		} catch {
			return false;
		}
	}

	function selectExportCode() {
		const codeElement = document.querySelector('.export-panel code');
		if (!codeElement) return false;

		const selection = window.getSelection();
		const range = document.createRange();
		range.selectNodeContents(codeElement);
		selection?.removeAllRanges();
		selection?.addRange(range);
		return true;
	}

	async function copyToClipboard(kind: 'css' | 'preset' | 'share', value: string) {
		const copiedToClipboard = await writeClipboard(value);
		if (!copiedToClipboard) {
			const selectedExport = kind === 'css' && selectExportCode();
			copyError = selectedExport
				? 'Clipboard blocked here. The CSS is selected for manual copy.'
				: 'Clipboard blocked here. Select the export text manually.';
			return;
		}

		copyError = '';
		copied = kind;
		setTimeout(() => {
			if (copied === kind) copied = null;
		}, 1600);
	}

	function updateMode(value: (typeof modeOptions)[number]['value']) {
		if (value === 'system') {
			resetMode();
			return;
		}

		setMode(value);
	}

	onMount(() => {
		const queryPreset = page.url.searchParams.get('preset');
		const storedPreset = queryPreset ?? localStorage.getItem(themePresetStorageKey);
		const parsedPreset = parseThemePreset(storedPreset);

		if (parsedPreset) {
			config = parsedPreset;
		}

		hasLoadedStoredTheme = true;
	});

	$effect(() => {
		if (!browser || !hasLoadedStoredTheme) return;

		localStorage.setItem(themePresetStorageKey, presetCode);
		window.dispatchEvent(new CustomEvent(themePresetChangeEvent, { detail: presetCode }));
	});
</script>

<svelte:head>
	<title>Theme Builder | {APP_NAME}</title>
	<meta
		name="description"
		content="Build and copy a Product Plate theme with live CSS variables, dark mode, and a product preview."
	/>
</svelte:head>

<div class="min-h-screen bg-background text-foreground">
	<LandingNav active="theme-builder" />

	<main
		class="theme-workbench"
		class:theme-workbench-pending={!hasLoadedStoredTheme}
		aria-busy={!hasLoadedStoredTheme}
	>
		<section class="builder-shell" aria-label="Theme builder">
			<aside class="customizer" aria-label="Theme controls">
				<div class="customizer-top">
					<div>
						<p>Preset</p>
						<strong>--preset {presetCode}</strong>
					</div>
					<div class="icon-actions">
						<Button variant="outline" size="icon" onclick={reset} aria-label="Reset theme">
							<RotateCcwIcon />
						</Button>
						<Button variant="outline" size="icon" onclick={randomize} aria-label="Randomize theme">
							<Dice5Icon />
						</Button>
					</div>
				</div>

				<section class="control-section">
					<h2>Mode</h2>
					<div class="mode-row" role="group" aria-label="Color mode">
						{#each modeOptions as option (option.value)}
							<button
								type="button"
								class:active={userPrefersMode.current === option.value}
								aria-pressed={userPrefersMode.current === option.value}
								onclick={() => updateMode(option.value)}
							>
								<option.icon />
								{option.label}
							</button>
						{/each}
					</div>
				</section>

				<section class="control-section preset-input">
					<h2>Open Preset</h2>
					<div>
						<input
							id="preset-code"
							bind:value={presetInput}
							placeholder={`--preset ${presetCode}`}
						/>
						<Button variant="secondary" size="sm" onclick={applyPreset}>Apply</Button>
					</div>
					{#if presetError}
						<p>{presetError}</p>
					{/if}
				</section>

				<section class="control-section">
					<h2>Style</h2>
					<div class="option-grid two">
						{#each themeStyles as style (style)}
							<button
								type="button"
								class="choice-card"
								class:active={config.style === style}
								aria-pressed={config.style === style}
								onclick={() => setConfig('style', style)}
							>
								<strong>{themeStyleMeta[style].name}</strong>
								<small>{styleDetails[style]}</small>
							</button>
						{/each}
					</div>
				</section>

				<section class="control-section">
					<h2>Base</h2>
					<div class="option-grid two">
						{#each baseColors as color (color)}
							<button
								type="button"
								class="choice-card color-choice"
								class:active={config.baseColor === color}
								aria-pressed={config.baseColor === color}
								onclick={() => setConfig('baseColor', color)}
							>
								<i style={`background: ${baseColorMeta[color].color}`}></i>
								<strong>{baseColorMeta[color].name}</strong>
							</button>
						{/each}
					</div>
				</section>

				<section class="control-section">
					<h2>Accent</h2>
					<div class="swatch-grid">
						{#each accentColors as color (color)}
							<button
								type="button"
								class:active={config.accentColor === color}
								title={accentColorMeta[color].name}
								aria-label={accentColorMeta[color].name}
								aria-pressed={config.accentColor === color}
								onclick={() => setConfig('accentColor', color)}
							>
								<span style={`background: ${accentColorMeta[color].color}`}></span>
								<small>{accentColorMeta[color].name}</small>
							</button>
						{/each}
					</div>
				</section>

				<section class="control-section">
					<h2>Charts</h2>
					<div class="swatch-grid">
						{#each chartColors as color (color)}
							<button
								type="button"
								class:active={config.chartColor === color}
								title={chartColorMeta[color].name}
								aria-label={chartColorMeta[color].name}
								aria-pressed={config.chartColor === color}
								onclick={() => setConfig('chartColor', color)}
							>
								<span style={`background: ${chartColorMeta[color].color}`}></span>
								<small>{chartColorMeta[color].name}</small>
							</button>
						{/each}
					</div>
				</section>

				<section class="control-section">
					<h2>Radius</h2>
					<div class="option-grid two">
						{#each radii as radius (radius)}
							<button
								type="button"
								class="choice-card radius-choice"
								class:active={config.radius === radius}
								aria-pressed={config.radius === radius}
								onclick={() => setConfig('radius', radius)}
							>
								<b style={`border-radius: ${radiusMeta[radius].value}`}></b>
								<strong>{radiusMeta[radius].name}</strong>
							</button>
						{/each}
					</div>
				</section>

				<section class="control-section">
					<h2>Body Font</h2>
					<div class="option-grid one">
						{#each fonts as font (font)}
							<button
								type="button"
								class="choice-card"
								class:active={config.font === font}
								aria-pressed={config.font === font}
								onclick={() => setConfig('font', font)}
							>
								<strong style={`font-family: ${fontMeta[font].value}`}>{fontMeta[font].name}</strong
								>
							</button>
						{/each}
					</div>
				</section>

				<section class="control-section">
					<h2>Heading Font</h2>
					<div class="option-grid one">
						<button
							type="button"
							class="choice-card"
							class:active={config.headingFont === 'inherit'}
							aria-pressed={config.headingFont === 'inherit'}
							onclick={() => setConfig('headingFont', 'inherit')}
						>
							<strong>Inherit body font</strong>
						</button>
						{#each fonts as font (font)}
							<button
								type="button"
								class="choice-card"
								class:active={config.headingFont === font}
								aria-pressed={config.headingFont === font}
								onclick={() => setConfig('headingFont', font)}
							>
								<strong style={`font-family: ${fontMeta[font].value}`}>{fontMeta[font].name}</strong
								>
							</button>
						{/each}
					</div>
				</section>

				<section class="control-section">
					<h2>Navigation</h2>
					<div class="option-grid two">
						{#each menuAccents as accent (accent)}
							<button
								type="button"
								class="choice-card"
								class:active={config.menuAccent === accent}
								aria-pressed={config.menuAccent === accent}
								onclick={() => setConfig('menuAccent', accent)}
							>
								<strong>{accent === 'bold' ? 'Bold' : 'Subtle'}</strong>
								<small
									>{accent === 'bold' ? 'Primary-filled active item' : 'Muted active item'}</small
								>
							</button>
						{/each}
					</div>
					<div class="option-grid one menu-colors">
						{#each menuColors as color (color)}
							<button
								type="button"
								class="choice-card"
								class:active={config.menuColor === color}
								aria-pressed={config.menuColor === color}
								onclick={() => setConfig('menuColor', color)}
							>
								<strong>{menuColorLabels[color]}</strong>
							</button>
						{/each}
					</div>
				</section>

				<section class="export-panel">
					<div class="export-actions">
						<Button
							variant="outline"
							size="sm"
							onclick={() => copyToClipboard('preset', `--preset ${presetCode}`)}
						>
							{#if copied === 'preset'}<CheckIcon />Copied{:else}<CopyIcon />Preset{/if}
						</Button>
						<Button variant="outline" size="sm" onclick={() => copyToClipboard('share', shareUrl)}>
							{#if copied === 'share'}<CheckIcon />Copied{:else}<CopyIcon />Share{/if}
						</Button>
						<Button size="sm" onclick={() => copyToClipboard('css', cssCode)}>
							{#if copied === 'css'}<CheckIcon />Copied{:else}<CopyIcon />Copy CSS{/if}
						</Button>
					</div>
					{#if copyError}
						<p class="export-error">{copyError}</p>
					{/if}
					<pre><code>{cssCode}</code></pre>
				</section>
			</aside>

			<section class="preview-column style-{config.style}" style={previewStyle}>
				<div class="preview-toolbar">
					<div>
						<span></span>
						<span></span>
						<span></span>
					</div>
					<p>{shareUrl || 'productplate.dev/theme-builder'}</p>
				</div>

				<div class="mock-page">
					<aside class="mock-sidebar">
						<div class="mock-brand">
							<span></span>
							<strong>Northstar</strong>
						</div>
						<nav aria-label="Preview navigation">
							<a class="active" href="#overview">Overview</a>
							<a href="#customers">Customers</a>
							<a href="#billing">Billing</a>
							<a href="#developer">Developer</a>
						</nav>
						<div class="mock-sidebar-card">
							<small>Plan</small>
							<strong>Scale</strong>
							<span>82% used</span>
						</div>
					</aside>

					<div class="mock-content">
						<header class="mock-nav">
							<div>
								<p>Workspace</p>
								<strong>Launch Command</strong>
							</div>
							<nav>
								<a href="#overview">Docs</a>
								<a href="#pricing">Pricing</a>
								<a href="#support">Support</a>
							</nav>
							<Button type="button" variant="outline" size="sm" class="mock-preview-button"
								>Invite</Button
							>
						</header>

						<section class="mock-hero">
							<div>
								<p class="mock-eyebrow">Product operating system</p>
								<h1>Launch the whole product surface from one clean base.</h1>
								<p>
									A landing page, workspace console, billing controls, and developer tools that
									share the same tokens.
								</p>
								<div class="mock-actions">
									<Button type="button" class="mock-preview-button">Start project</Button>
									<Button type="button" variant="outline" class="mock-preview-button"
										>Read docs</Button
									>
								</div>
							</div>

							<div class="mock-panel">
								<div class="mock-panel-header">
									<p>Workspace health</p>
									<span>Live</span>
								</div>
								<div class="mock-chart">
									{#each [42, 66, 58, 78, 71, 86, 82, 96] as height, index (index)}
										<span style={`height: ${height}%`}></span>
									{/each}
								</div>
								<div class="mock-stats">
									<div>
										<strong>18</strong>
										<span>Seats</span>
									</div>
									<div>
										<strong>92k</strong>
										<span>API calls</span>
									</div>
								</div>
							</div>
						</section>

						<section class="mock-grid">
							<div>
								<h2>Auth</h2>
								<p>Profiles, sessions, OAuth, and onboarding.</p>
							</div>
							<div>
								<h2>Billing</h2>
								<p>Plans, entitlements, portal, and checkout.</p>
							</div>
							<div>
								<h2>Developer</h2>
								<p>API keys, webhooks, scopes, and events.</p>
							</div>
						</section>

						<section class="mock-lower">
							<div class="mock-table">
								<div class="mock-row heading">
									<span>Customer</span>
									<span>Status</span>
									<span>MRR</span>
								</div>
								{#each ['Acme Labs', 'Pioneer AI', 'Northwind'] as customer, index (customer)}
									<div class="mock-row">
										<span>{customer}</span>
										<span>{index === 1 ? 'Trial' : 'Active'}</span>
										<span>${[420, 99, 260][index]}</span>
									</div>
								{/each}
							</div>

							<form class="mock-form" aria-label="Preview form">
								<label>
									<span>Invite email</span>
									<input value="founder@acme.test" readonly />
								</label>
								<label>
									<span>Role</span>
									<select value="admin" aria-label="Role">
										<option value="admin">Admin</option>
										<option value="member">Member</option>
									</select>
								</label>
								<Button type="button" class="mock-preview-button mock-preview-button-full"
									>Send invite</Button
								>
							</form>
						</section>
					</div>
				</div>
			</section>
		</section>
	</main>
</div>

<style>
	.theme-workbench {
		max-width: 118rem;
		margin-inline: auto;
		padding: clamp(0.5rem, 1.4vw, 0.9rem);
	}

	.theme-workbench-pending {
		visibility: hidden;
	}

	.builder-shell {
		display: grid;
		grid-template-columns: minmax(18rem, 22rem) minmax(0, 1fr);
		gap: 1rem;
		align-items: start;
	}

	.customizer,
	.preview-column {
		border: 1px solid var(--border);
		background: var(--card);
		box-shadow: 0 18px 48px color-mix(in oklch, var(--foreground) 6%, transparent);
	}

	.customizer {
		position: sticky;
		top: 4.5rem;
		display: flex;
		max-height: calc(100svh - 4.75rem);
		flex-direction: column;
		gap: 1rem;
		overflow: auto;
		border-radius: 0.75rem;
		padding: 1rem;
	}

	.preview-column {
		--mock-space: 1rem;
		--mock-padding: 1rem;
		--mock-radius: var(--radius);
		--mock-hero-size: clamp(2.1rem, 3.25vw, 3.65rem);
		position: sticky;
		top: 4.5rem;
		display: flex;
		max-height: calc(100svh - 4.75rem);
		flex-direction: column;
		overflow: hidden;
		border-radius: 0.75rem;
		color: var(--foreground);
		background: var(--background);
		font-family: var(--pp-theme-font);
	}

	.preview-column.style-default {
		--mock-space: 0.95rem;
		--mock-padding: 0.95rem;
		--mock-hero-size: clamp(2rem, 3.1vw, 3.35rem);
	}

	.preview-column.style-new-york {
		--mock-space: 0.75rem;
		--mock-padding: 0.85rem;
		--mock-hero-size: clamp(1.9rem, 2.9vw, 3.05rem);
	}

	.preview-column.style-compact {
		--mock-space: 0.65rem;
		--mock-padding: 0.75rem;
		--mock-hero-size: clamp(1.75rem, 2.7vw, 2.85rem);
		font-size: 0.92rem;
	}

	.preview-column.style-editorial {
		--mock-space: 1.35rem;
		--mock-padding: 1.35rem;
		--mock-hero-size: clamp(2.3rem, 3.7vw, 4.15rem);
	}

	.preview-column.style-soft {
		--mock-space: 1.15rem;
		--mock-padding: 1.15rem;
		--mock-radius: calc(var(--radius) + 0.3rem);
		--mock-hero-size: clamp(2.1rem, 3.25vw, 3.55rem);
	}

	.preview-column.style-sharp {
		--mock-space: 0.9rem;
		--mock-padding: 0.95rem;
		--mock-radius: 0.2rem;
		--mock-hero-size: clamp(2rem, 3vw, 3.25rem);
	}

	.preview-column.style-mono {
		--mock-space: 0.85rem;
		--mock-padding: 0.95rem;
		--mock-hero-size: clamp(1.85rem, 2.9vw, 3rem);
		font-family: 'JetBrains Mono Variable', ui-monospace, monospace;
	}

	.preview-column.style-console {
		--mock-space: 0.85rem;
		--mock-padding: 0.9rem;
		--mock-radius: 0.25rem;
		font-family:
			'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
			'Liberation Mono', monospace;
	}

	.preview-column.style-spacious {
		--mock-space: 1.45rem;
		--mock-padding: 1.45rem;
		--mock-hero-size: clamp(2.3rem, 3.6vw, 4rem);
	}

	.preview-column.style-sharp .mock-nav,
	.preview-column.style-sharp .mock-hero,
	.preview-column.style-sharp .mock-grid > div,
	.preview-column.style-sharp .mock-panel,
	.preview-column.style-sharp .mock-table,
	.preview-column.style-sharp .mock-form,
	.preview-column.style-sharp .mock-sidebar-card,
	.preview-column.style-console .mock-nav,
	.preview-column.style-console .mock-hero,
	.preview-column.style-console .mock-grid > div,
	.preview-column.style-console .mock-panel,
	.preview-column.style-console .mock-table,
	.preview-column.style-console .mock-form,
	.preview-column.style-console .mock-sidebar-card {
		border-style: dashed;
	}

	.customizer-top,
	.export-actions,
	.preset-input > div {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.customizer-top {
		justify-content: space-between;
	}

	.customizer-top p,
	.customizer-top strong,
	.control-section h2 {
		margin: 0;
	}

	.customizer-top p,
	.control-section h2 {
		color: var(--muted-foreground);
		font-size: 0.75rem;
		font-weight: 800;
		text-transform: uppercase;
	}

	.customizer-top strong {
		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
		font-size: 0.92rem;
	}

	.icon-actions {
		display: flex;
		gap: 0.45rem;
	}

	.control-section {
		display: grid;
		gap: 0.65rem;
		border-top: 1px solid var(--border);
		padding-top: 1rem;
	}

	.mode-row,
	.option-grid,
	.swatch-grid,
	.export-actions {
		display: grid;
		gap: 0.5rem;
	}

	.mode-row {
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border: 1px solid var(--border);
		border-radius: 0.65rem;
		background: var(--muted);
		padding: 0.25rem;
	}

	.mode-row button,
	.choice-card,
	.swatch-grid button {
		border: 1px solid transparent;
		background: transparent;
		color: var(--foreground);
		font: inherit;
		text-align: left;
	}

	.mode-row button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		min-height: 2.15rem;
		border-radius: 0.45rem;
		color: var(--muted-foreground);
		font-size: 0.78rem;
		font-weight: 750;
	}

	.mode-row button.active {
		background: var(--background);
		color: var(--foreground);
		box-shadow: 0 6px 18px color-mix(in oklch, var(--foreground) 8%, transparent);
	}

	.mode-row button :global(svg) {
		width: 0.95rem;
		height: 0.95rem;
	}

	.preset-input input {
		min-width: 0;
		height: 2.25rem;
		flex: 1;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		background: var(--background);
		padding: 0 0.7rem;
		color: var(--foreground);
		font-size: 0.86rem;
	}

	.preset-input p,
	.export-error {
		margin: 0;
		color: var(--destructive);
		font-size: 0.78rem;
	}

	.option-grid.two {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.option-grid.one,
	.menu-colors,
	.export-actions {
		grid-template-columns: minmax(0, 1fr);
	}

	.choice-card,
	.swatch-grid button {
		min-width: 0;
		border-color: var(--border);
		border-radius: 0.65rem;
		background: var(--background);
		padding: 0.7rem;
		transition:
			border-color 140ms ease,
			background-color 140ms ease,
			transform 140ms ease;
	}

	.choice-card:hover,
	.swatch-grid button:hover,
	.choice-card.active,
	.swatch-grid button.active {
		border-color: var(--primary);
		background: color-mix(in oklch, var(--primary) 10%, var(--background));
	}

	.choice-card.active,
	.swatch-grid button.active {
		box-shadow: inset 0 0 0 1px var(--primary);
	}

	.choice-card strong,
	.choice-card small,
	.swatch-grid small {
		display: block;
		min-width: 0;
	}

	.choice-card strong {
		font-size: 0.86rem;
	}

	.choice-card small,
	.swatch-grid small {
		margin-top: 0.25rem;
		color: var(--muted-foreground);
		font-size: 0.72rem;
		line-height: 1.3;
	}

	.color-choice,
	.radius-choice {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.color-choice i {
		display: block;
		width: 1rem;
		height: 1rem;
		border-radius: 999px;
		box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--foreground) 16%, transparent);
	}

	.radius-choice b {
		display: block;
		width: 1.35rem;
		height: 1.35rem;
		border: 1px solid var(--primary);
		background: color-mix(in oklch, var(--primary) 14%, transparent);
	}

	.swatch-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.swatch-grid button {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.55rem;
	}

	.swatch-grid span {
		width: 1.25rem;
		height: 1.25rem;
		flex: 0 0 auto;
		border-radius: 999px;
		box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--foreground) 18%, transparent);
	}

	.export-panel {
		display: grid;
		gap: 0.75rem;
		border-top: 1px solid var(--border);
		padding-top: 1rem;
	}

	.export-actions {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.export-actions :global(button) {
		min-width: 0;
	}

	.export-panel pre {
		max-height: 17rem;
		margin: 0;
		overflow: auto;
		border: 1px solid var(--border);
		border-radius: 0.65rem;
		background: var(--muted);
		padding: 0.85rem;
		color: var(--muted-foreground);
		font-size: 0.72rem;
		line-height: 1.6;
	}

	.preview-toolbar {
		display: flex;
		align-items: center;
		gap: 1rem;
		min-width: 0;
		border-bottom: 1px solid var(--border);
		background: var(--card);
		padding: 0.8rem 1rem;
	}

	.preview-toolbar div {
		display: flex;
		gap: 0.4rem;
	}

	.preview-toolbar span {
		width: 0.7rem;
		height: 0.7rem;
		border-radius: 999px;
		background: var(--muted);
	}

	.preview-toolbar span:nth-child(1) {
		background: oklch(0.68 0.2 32);
	}

	.preview-toolbar span:nth-child(2) {
		background: oklch(0.78 0.17 78);
	}

	.preview-toolbar span:nth-child(3) {
		background: oklch(0.65 0.16 150);
	}

	.preview-toolbar p {
		min-width: 0;
		margin: 0;
		overflow: hidden;
		color: var(--muted-foreground);
		font-size: 0.78rem;
		font-weight: 650;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.mock-page {
		display: grid;
		grid-template-columns: minmax(11rem, 14rem) minmax(0, 1fr);
		height: min(56rem, calc(100svh - 8rem));
		min-height: min(42rem, calc(100svh - 8rem));
		overflow: auto;
		background:
			linear-gradient(color-mix(in oklch, var(--primary) 5%, transparent) 1px, transparent 1px),
			linear-gradient(
				90deg,
				color-mix(in oklch, var(--primary) 5%, transparent) 1px,
				transparent 1px
			),
			var(--background);
		background-size: 42px 42px;
	}

	.mock-sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--mock-space);
		border-right: 1px solid var(--sidebar-border);
		background: var(--sidebar);
		color: var(--sidebar-foreground);
		padding: var(--mock-padding);
	}

	.mock-brand,
	.mock-sidebar nav,
	.mock-content,
	.mock-actions,
	.mock-panel,
	.mock-lower,
	.mock-form {
		display: grid;
		gap: var(--mock-space);
	}

	.mock-brand {
		grid-template-columns: auto 1fr;
		align-items: center;
	}

	.mock-brand span {
		width: 1.9rem;
		height: 1.9rem;
		border-radius: calc(var(--mock-radius) * 0.75);
		background: var(--sidebar-primary);
	}

	.mock-brand strong {
		font-size: 0.9rem;
	}

	.mock-sidebar nav a {
		border-radius: calc(var(--mock-radius) * 0.8);
		padding: 0.62rem 0.7rem;
		color: color-mix(in oklch, var(--sidebar-foreground) 72%, transparent);
		font-size: 0.84rem;
		font-weight: 700;
	}

	.mock-sidebar nav a.active {
		background: var(--sidebar-accent);
		color: var(--sidebar-accent-foreground);
	}

	.mock-sidebar-card {
		margin-top: auto;
		border: var(--pp-theme-border-width) solid var(--sidebar-border);
		border-radius: var(--mock-radius);
		background: color-mix(in oklch, var(--sidebar-accent) 50%, transparent);
		padding: var(--mock-padding);
	}

	.mock-sidebar-card small,
	.mock-sidebar-card span {
		display: block;
		color: color-mix(in oklch, var(--sidebar-foreground) 68%, transparent);
		font-size: 0.76rem;
	}

	.mock-sidebar-card strong {
		display: block;
		margin: 0.2rem 0;
	}

	.mock-content {
		padding: clamp(1rem, 2.3vw, 2rem);
	}

	.mock-nav,
	.mock-hero,
	.mock-grid > div,
	.mock-panel,
	.mock-table,
	.mock-form {
		border: var(--pp-theme-border-width) solid var(--border);
		border-radius: var(--mock-radius);
		background: color-mix(in oklch, var(--card) 96%, transparent);
		color: var(--card-foreground);
		box-shadow: 0 14px 32px
			color-mix(in oklch, var(--foreground) var(--pp-theme-shadow-alpha), transparent);
	}

	.mock-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: calc(var(--mock-padding) * 0.85) var(--mock-padding);
	}

	.mock-nav p,
	.mock-nav strong,
	.mock-hero h1,
	.mock-hero p,
	.mock-grid h2,
	.mock-grid p,
	.mock-panel-header p,
	.mock-panel-header span {
		margin: 0;
	}

	.mock-nav p {
		color: var(--muted-foreground);
		font-size: 0.75rem;
		font-weight: 750;
	}

	.mock-nav nav,
	.mock-actions,
	.mock-panel-header,
	.mock-stats {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.mock-nav a {
		color: var(--muted-foreground);
		font-size: 0.82rem;
		font-weight: 750;
	}

	:global(.mock-preview-button) {
		width: fit-content;
		border-radius: calc(var(--mock-radius) * 0.85);
	}

	:global(.mock-preview-button-full) {
		width: 100%;
	}

	.mock-hero {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(16rem, 0.9fr);
		gap: clamp(1rem, 2vw, 2rem);
		align-items: center;
		padding: clamp(1.25rem, 3vw, 3rem);
	}

	.mock-eyebrow {
		color: var(--primary);
		font-size: 0.78rem;
		font-weight: 850;
	}

	.mock-hero h1 {
		max-width: 20ch;
		font-family: var(--pp-theme-heading-font);
		font-size: var(--mock-hero-size);
		font-weight: 760;
		letter-spacing: 0;
		line-height: 1.02;
	}

	.mock-hero p:not(.mock-eyebrow) {
		max-width: 36rem;
		margin-top: 1rem;
		color: var(--muted-foreground);
		line-height: 1.65;
	}

	.mock-actions {
		flex-wrap: wrap;
		margin-top: 1.25rem;
	}

	.mock-panel {
		padding: var(--mock-padding);
	}

	.mock-panel-header {
		justify-content: space-between;
	}

	.mock-panel-header p {
		font-weight: 760;
	}

	.mock-panel-header span {
		border-radius: 999px;
		background: var(--accent);
		padding: 0.25rem 0.55rem;
		color: var(--accent-foreground);
		font-size: 0.72rem;
	}

	.mock-chart {
		display: flex;
		align-items: end;
		gap: 0.45rem;
		height: 12rem;
		border-radius: calc(var(--mock-radius) * 0.9);
		background: var(--muted);
		padding: 1rem;
	}

	.mock-chart span {
		flex: 1;
		min-width: 0.75rem;
		border-radius: 999px 999px 0 0;
		background: var(--chart-1);
	}

	.mock-chart span:nth-child(2n) {
		background: var(--chart-2);
	}

	.mock-chart span:nth-child(3n) {
		background: var(--chart-3);
	}

	.mock-stats {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.mock-stats div {
		border: 1px solid var(--border);
		border-radius: calc(var(--mock-radius) * 0.8);
		padding: 0.8rem;
	}

	.mock-stats strong {
		display: block;
		font-size: 1.45rem;
	}

	.mock-stats span,
	.mock-grid p,
	.mock-row,
	.mock-form span {
		color: var(--muted-foreground);
		font-size: 0.82rem;
	}

	.mock-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--mock-space);
	}

	.mock-grid > div {
		padding: var(--mock-padding);
	}

	.mock-grid h2 {
		font-size: 1rem;
	}

	.mock-grid p {
		margin-top: 0.45rem;
		line-height: 1.5;
	}

	.mock-lower {
		grid-template-columns: minmax(0, 1fr) minmax(17rem, 0.45fr);
	}

	.mock-table {
		overflow: hidden;
	}

	.mock-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 6rem 5rem;
		gap: 1rem;
		border-bottom: 1px solid var(--border);
		padding: 0.85rem var(--mock-padding);
	}

	.mock-row:last-child {
		border-bottom: 0;
	}

	.mock-row.heading {
		background: var(--muted);
		color: var(--foreground);
		font-weight: 800;
	}

	.mock-form {
		align-content: start;
		padding: var(--mock-padding);
	}

	.mock-form label {
		display: grid;
		gap: 0.35rem;
	}

	.mock-form input,
	.mock-form select {
		min-width: 0;
		height: 2.35rem;
		border: 1px solid var(--border);
		border-radius: calc(var(--mock-radius) * 0.75);
		background: var(--background);
		padding: 0 0.7rem;
		color: var(--foreground);
	}

	@media (max-width: 1180px) {
		.builder-shell {
			grid-template-columns: 1fr;
		}

		.customizer {
			position: relative;
			top: auto;
			max-height: none;
		}

		.preview-column {
			order: -1;
			position: relative;
			top: auto;
			max-height: none;
		}

		.mock-page {
			height: min(44rem, calc(100svh - 7.5rem));
		}
	}

	@media (max-width: 820px) {
		.mock-page,
		.mock-hero,
		.mock-lower {
			grid-template-columns: 1fr;
		}

		.mock-sidebar {
			display: none;
		}

		.mock-nav nav {
			display: none;
		}

		.mock-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 560px) {
		.theme-workbench {
			padding: 0.75rem;
		}

		.option-grid.two,
		.swatch-grid,
		.export-actions,
		.mode-row {
			grid-template-columns: 1fr;
		}

		.mock-row {
			grid-template-columns: 1fr;
			gap: 0.25rem;
		}
	}
</style>
