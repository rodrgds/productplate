<script lang="ts">
	import { APP_NAME, APP_URL } from '$lib/constants.js';

	const entries = [
		{
			version: '0.2.0',
			title: 'Starter kit hardening',
			items: [
				'Organizations and RBAC',
				'Entitlements and admin overrides',
				'Theme builder',
				'API keys and webhook template'
			]
		},
		{
			version: '0.1.0',
			title: 'Initial product plate',
			items: [
				'SvelteKit app shell',
				'Better Auth',
				'Convex realtime data',
				'Autumn billing',
				'AI SDK examples'
			]
		}
	];
</script>

<svelte:head>
	<title>Changelog | {APP_NAME}</title>
	<meta
		name="description"
		content="Product Plate release notes and starter-template improvements."
	/>
	<link rel="canonical" href={`${APP_URL}/changelog`} />
</svelte:head>

<main class="mx-auto max-w-4xl px-6 py-16">
	<div class="mb-10 space-y-3">
		<p class="text-sm font-medium text-primary">Changelog</p>
		<h1 class="text-4xl font-semibold tracking-tight">What changed</h1>
	</div>
	<div class="space-y-6">
		{#each entries as entry (entry.version)}
			<article class="rounded-lg border bg-card p-6">
				<div class="flex flex-wrap items-center gap-3">
					<span class="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
						>{entry.version}</span
					>
					<h2 class="text-xl font-semibold">{entry.title}</h2>
				</div>
				<ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
					{#each entry.items as item (item)}
						<li>{item}</li>
					{/each}
				</ul>
			</article>
		{/each}
	</div>
</main>
