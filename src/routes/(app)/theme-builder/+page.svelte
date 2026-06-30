<script lang="ts">
	import { APP_NAME } from '$lib/constants.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
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
		radii,
		radiusMeta,
		themeStyleMeta,
		themeStyles,
		type ThemePreset
	} from '$lib/theme-builder.js';
	import { Check, Copy, Dice5, RotateCcw, WandSparkles } from '@lucide/svelte';

	const headingFonts = ['inherit', ...fonts] as const;

	let config = $state<ThemePreset>({ ...defaultThemePreset });
	let copied = $state<'css' | 'preset' | null>(null);
	let presetInput = $state('');
	let presetError = $state('');

	let presetCode = $derived(encodeThemePreset(config));
	let cssCode = $derived(getThemeCss(config));
	let previewStyle = $derived(
		`${getPreviewStyle(config)}; font-family: ${fontMeta[config.font].value}`
	);
	let headingStyle = $derived(
		config.headingFont === 'inherit' ? '' : `font-family: ${fontMeta[config.headingFont].value}`
	);

	function setConfig<Key extends keyof ThemePreset>(key: Key, value: ThemePreset[Key]) {
		config[key] = value;
	}

	async function copyToClipboard(kind: 'css' | 'preset', value: string) {
		await navigator.clipboard.writeText(value);
		copied = kind;
		setTimeout(() => {
			if (copied === kind) copied = null;
		}, 1800);
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
</script>

<svelte:head>
	<title>Theme Builder | {APP_NAME}</title>
</svelte:head>

<header
	class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium">Theme Builder</h1>
		<div class="ml-auto hidden items-center gap-2 sm:flex">
			<Button variant="outline" size="sm" onclick={reset}>
				<RotateCcw />
				Reset
			</Button>
			<Button variant="outline" size="sm" onclick={randomize}>
				<Dice5 />
				Random
			</Button>
		</div>
	</div>
</header>

<main class="flex flex-1 flex-col gap-4 p-4 lg:p-6">
	<section class="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
		<Card.Root class="gap-0 overflow-hidden">
			<Card.Header class="border-b">
				<Card.Title class="flex items-center gap-2 text-base">
					<WandSparkles class="size-4 text-primary" />
					Preset
				</Card.Title>
				<Card.Description>
					Generate a starter theme, copy CSS variables, or share the compact preset code.
				</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-5 p-4">
				<div class="space-y-2">
					<label class="text-sm font-medium" for="preset-code">Preset code</label>
					<div class="flex gap-2">
						<input
							id="preset-code"
							class="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm"
							bind:value={presetInput}
							placeholder={presetCode}
						/>
						<Button variant="secondary" size="sm" onclick={applyPreset}>Apply</Button>
					</div>
					{#if presetError}
						<p class="text-xs text-destructive">{presetError}</p>
					{:else}
						<p class="text-xs text-muted-foreground">Current: --preset {presetCode}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<p class="text-sm font-medium">Style</p>
					<div class="grid grid-cols-2 gap-2">
						{#each themeStyles as style (style)}
							<button
								type="button"
								class="rounded-md border px-3 py-2 text-left text-sm transition hover:bg-muted data-[active=true]:border-primary data-[active=true]:bg-primary/10"
								data-active={config.style === style}
								onclick={() => setConfig('style', style)}
							>
								{themeStyleMeta[style].name}
							</button>
						{/each}
					</div>
				</div>

				<div class="space-y-2">
					<p class="text-sm font-medium">Base</p>
					<div class="grid grid-cols-3 gap-2">
						{#each baseColors as color (color)}
							<button
								type="button"
								class="flex items-center gap-2 rounded-md border px-2 py-2 text-sm transition hover:bg-muted data-[active=true]:border-primary data-[active=true]:bg-primary/10"
								data-active={config.baseColor === color}
								onclick={() => setConfig('baseColor', color)}
							>
								<span
									class="size-3 rounded-full border"
									style={`background: ${baseColorMeta[color].color}`}
								></span>
								{baseColorMeta[color].name}
							</button>
						{/each}
					</div>
				</div>

				<div class="space-y-2">
					<p class="text-sm font-medium">Accent</p>
					<div class="grid grid-cols-4 gap-2">
						{#each accentColors as color (color)}
							<button
								type="button"
								class="flex h-9 items-center justify-center rounded-md border transition hover:scale-[1.02] data-[active=true]:ring-2 data-[active=true]:ring-primary"
								data-active={config.accentColor === color}
								title={accentColorMeta[color].name}
								onclick={() => setConfig('accentColor', color)}
							>
								<span
									class="size-5 rounded-full"
									style={`background: ${accentColorMeta[color].color}`}
								></span>
							</button>
						{/each}
					</div>
				</div>

				<div class="grid gap-3 sm:grid-cols-2">
					<label class="space-y-2 text-sm font-medium">
						<span>Radius</span>
						<select
							class="h-9 w-full rounded-md border bg-background px-2 text-sm"
							value={config.radius}
							onchange={(event) =>
								setConfig('radius', event.currentTarget.value as ThemePreset['radius'])}
						>
							{#each radii as radius (radius)}
								<option value={radius}>{radiusMeta[radius].name}</option>
							{/each}
						</select>
					</label>
					<label class="space-y-2 text-sm font-medium">
						<span>Chart</span>
						<select
							class="h-9 w-full rounded-md border bg-background px-2 text-sm"
							value={config.chartColor}
							onchange={(event) =>
								setConfig('chartColor', event.currentTarget.value as ThemePreset['chartColor'])}
						>
							{#each chartColors as color (color)}
								<option value={color}>{chartColorMeta[color].name}</option>
							{/each}
						</select>
					</label>
					<label class="space-y-2 text-sm font-medium">
						<span>Font</span>
						<select
							class="h-9 w-full rounded-md border bg-background px-2 text-sm"
							value={config.font}
							onchange={(event) =>
								setConfig('font', event.currentTarget.value as ThemePreset['font'])}
						>
							{#each fonts as font (font)}
								<option value={font}>{fontMeta[font].name}</option>
							{/each}
						</select>
					</label>
					<label class="space-y-2 text-sm font-medium">
						<span>Heading</span>
						<select
							class="h-9 w-full rounded-md border bg-background px-2 text-sm"
							value={config.headingFont}
							onchange={(event) =>
								setConfig('headingFont', event.currentTarget.value as ThemePreset['headingFont'])}
						>
							<option value="inherit">Inherit</option>
							{#each fonts as font (font)}
								<option value={font}>{fontMeta[font].name}</option>
							{/each}
						</select>
					</label>
				</div>

				<div class="grid gap-3 sm:grid-cols-2">
					<label class="space-y-2 text-sm font-medium">
						<span>Menu accent</span>
						<select
							class="h-9 w-full rounded-md border bg-background px-2 text-sm"
							value={config.menuAccent}
							onchange={(event) =>
								setConfig('menuAccent', event.currentTarget.value as ThemePreset['menuAccent'])}
						>
							<option value="subtle">Subtle</option>
							<option value="bold">Bold</option>
						</select>
					</label>
					<label class="space-y-2 text-sm font-medium">
						<span>Menu color</span>
						<select
							class="h-9 w-full rounded-md border bg-background px-2 text-sm"
							value={config.menuColor}
							onchange={(event) =>
								setConfig('menuColor', event.currentTarget.value as ThemePreset['menuColor'])}
						>
							<option value="default">Default</option>
							<option value="inverted">Inverted</option>
							<option value="translucent">Translucent</option>
						</select>
					</label>
				</div>
			</Card.Content>
		</Card.Root>

		<div class="grid gap-4">
			<Card.Root class="overflow-hidden">
				<Card.Header class="border-b">
					<Card.Title class="text-base">Live preview</Card.Title>
					<Card.Description
						>Dashboard shell, forms, charts, and notifications using the generated variables.</Card.Description
					>
				</Card.Header>
				<Card.Content class="p-0">
					<div class="bg-background text-foreground" style={previewStyle}>
						<div class="grid min-h-[520px] md:grid-cols-[220px_minmax(0,1fr)]">
							<aside class="border-r bg-[var(--sidebar)] p-4 text-[var(--sidebar-foreground)]">
								<div class="mb-6 flex items-center gap-2 font-semibold" style={headingStyle}>
									<span class="size-6 rounded-md bg-[var(--sidebar-primary)]"></span>
									Product Plate
								</div>
								<nav class="space-y-1 text-sm">
									<div
										class="rounded-md bg-[var(--sidebar-accent)] px-3 py-2 text-[var(--sidebar-accent-foreground)]"
									>
										Dashboard
									</div>
									<div class="px-3 py-2 text-muted-foreground">Workspace</div>
									<div class="px-3 py-2 text-muted-foreground">Developer</div>
									<div class="px-3 py-2 text-muted-foreground">Billing</div>
								</nav>
							</aside>
							<section class="space-y-4 p-4">
								<div class="flex flex-wrap items-center justify-between gap-3">
									<div>
										<p class="text-sm text-muted-foreground">Starter workspace</p>
										<h2 class="text-2xl font-semibold" style={headingStyle}>Launch room</h2>
									</div>
									<button
										class="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
									>
										Invite member
									</button>
								</div>
								<div class="grid gap-3 md:grid-cols-3">
									{#each ['MRR', 'Active seats', 'API calls'] as label, index (label)}
										<div class="rounded-lg border bg-card p-4 text-card-foreground">
											<p class="text-sm text-muted-foreground">{label}</p>
											<p class="mt-2 text-2xl font-semibold" style={headingStyle}>
												{index === 0 ? '$4.8k' : index === 1 ? '18' : '92k'}
											</p>
											<div class="mt-3 h-2 rounded-full bg-muted">
												<div
													class="h-2 rounded-full bg-[var(--chart-1)]"
													style={`width: ${index === 0 ? 72 : index === 1 ? 58 : 84}%`}
												></div>
											</div>
										</div>
									{/each}
								</div>
								<div class="grid gap-3 lg:grid-cols-[1fr_280px]">
									<div class="rounded-lg border bg-card p-4">
										<div class="mb-4 flex items-center justify-between">
											<h3 class="font-semibold" style={headingStyle}>Usage trend</h3>
											<span class="bg-signal-soft rounded-full px-2 py-1 text-xs text-foreground"
												>Healthy</span
											>
										</div>
										<div class="flex h-36 items-end gap-2">
											{#each [42, 64, 52, 78, 68, 88, 74, 95] as value, index (index)}
												<div
													class="flex-1 rounded-t-md bg-[var(--chart-1)]"
													style={`height: ${value}%`}
												></div>
											{/each}
										</div>
									</div>
									<div class="space-y-3 rounded-lg border bg-card p-4">
										<h3 class="font-semibold" style={headingStyle}>Notifications</h3>
										<div class="rounded-md bg-muted p-3 text-sm">
											<p class="font-medium">Webhook created</p>
											<p class="text-muted-foreground">
												Endpoint is waiting for its first delivery.
											</p>
										</div>
										<div class="rounded-md border p-3 text-sm">
											<p class="font-medium">Entitlement nearing limit</p>
											<p class="text-muted-foreground">API keys 2 of 3 used.</p>
										</div>
									</div>
								</div>
							</section>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<div class="grid gap-4 lg:grid-cols-2">
				<Card.Root>
					<Card.Header class="border-b">
						<Card.Title class="text-base">CSS variables</Card.Title>
						<Card.Description
							>Replace the variable blocks in <code>src/app.css</code>.</Card.Description
						>
					</Card.Header>
					<Card.Content class="p-0">
						<div class="relative">
							<Button
								class="absolute top-3 right-3"
								variant="secondary"
								size="sm"
								onclick={() => copyToClipboard('css', cssCode)}
							>
								{#if copied === 'css'}
									<Check />
									Copied
								{:else}
									<Copy />
									Copy
								{/if}
							</Button>
							<pre class="max-h-[360px] overflow-auto p-4 pr-24 text-xs leading-5"><code
									>{cssCode}</code
								></pre>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="border-b">
						<Card.Title class="text-base">Preset</Card.Title>
						<Card.Description
							>Use this compact code in kickstart docs, screenshots, or handoff notes.</Card.Description
						>
					</Card.Header>
					<Card.Content class="space-y-4 p-4">
						<div class="rounded-lg border bg-muted p-4 font-mono text-sm">
							--preset {presetCode}
						</div>
						<Button
							variant="outline"
							onclick={() => copyToClipboard('preset', `--preset ${presetCode}`)}
						>
							{#if copied === 'preset'}
								<Check />
								Copied
							{:else}
								<Copy />
								Copy preset
							{/if}
						</Button>
						<div class="grid gap-2 text-sm text-muted-foreground">
							<p>Accent defaults to orange for the updated Product Plate direction.</p>
							<p>
								Preset decoding is local, so this works without a network call or registry
								dependency.
							</p>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</section>
</main>
