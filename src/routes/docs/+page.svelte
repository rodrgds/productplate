<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { APP_DESCRIPTION, APP_NAME, APP_URL } from '$lib/constants.js';
	import PublicPageShell from '$lib/components/public-page-shell.svelte';

	const sourceRoot = 'https://github.com/rodrgds/productplate/blob/main';
	const guides = [
		{
			title: 'Start',
			description: 'Answer the product brief and choose the smallest coherent product loop.',
			href: `${sourceRoot}/START_HERE.md`
		},
		{
			title: 'Customize',
			description: 'Choose one data, billing, platform, and public-site path.',
			href: `${sourceRoot}/docs/template-options.md`
		},
		{
			title: 'Ship',
			description: 'Run the real verification gates and configure deployment secrets.',
			href: `${sourceRoot}/README.md#commands`
		}
	] as const;
</script>

<svelte:head>
	<title>Docs | {APP_NAME}</title>
	<meta
		name="description"
		content="Product Plate setup, architecture, and production handoff documentation."
	/>
	<link rel="canonical" href={`${APP_URL}/docs`} />
</svelte:head>

<PublicPageShell>
	<main id="main-content" class="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
		<section class="max-w-3xl space-y-4">
			<p class="text-sm font-medium text-primary">Documentation</p>
			<h1 class="text-4xl font-semibold tracking-tight">Build from a real product surface.</h1>
			<p class="text-lg text-muted-foreground">{APP_DESCRIPTION}</p>
		</section>

		<section class="grid gap-4 md:grid-cols-3">
			{#each guides as guide (guide.title)}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a
					href={guide.href}
					class="rounded-lg border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/30"
				>
					<h2 class="font-semibold">{guide.title}</h2>
					<p class="mt-2 text-sm text-muted-foreground">{guide.description}</p>
				</a>
			{/each}
		</section>

		<section class="grid gap-3 text-sm text-muted-foreground">
			<h2 class="text-xl font-semibold text-foreground">Core paths</h2>
			<p>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a class="underline underline-offset-4" href={`${sourceRoot}/START_HERE.md`}
					><code>START_HERE.md</code></a
				> guides product discovery and stack selection.
			</p>
			<p>
				<code>src/routes/(app)</code> contains dashboard, settings, billing, workspace, developer, and
				admin surfaces.
			</p>
			<p>
				<code>src/convex</code> contains auth, billing, organizations, entitlements, notifications, and
				API keys.
			</p>
			<p>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a
					class="underline underline-offset-4"
					href={`${sourceRoot}/docs/observability-security.md`}
					><code>docs/observability-security.md</code></a
				> covers request logging, security headers, and secret-handling defaults.
			</p>
		</section>
	</main>
</PublicPageShell>
