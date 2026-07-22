<script lang="ts">
	import PublicPageShell from '$lib/components/public-page-shell.svelte';
	import Seo from '$lib/components/seo.svelte';
	import { showcaseEntries } from '$lib/showcase';
	import { APP_URL } from '$lib/constants';
</script>

<!-- External showcase URLs come from reviewed repository data. -->
<!-- eslint-disable svelte/no-navigation-without-resolve -->

<Seo
	title="Built with Product Plate"
	description="Reviewed products built from Product Plate."
	canonical={`${APP_URL}/showcase`}
	robots={showcaseEntries.length === 0 ? 'noindex,follow' : 'index,follow'}
/>

<PublicPageShell
	title="Built with Product Plate"
	eyebrow="Showcase"
	description="A reviewed list maintained as repository data. Submit a product through GitHub Discussions."
>
	{#if showcaseEntries.length === 0}
		<div class="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
			The showcase opens after the first reviewed submission. No custom community or leaderboard
			data is collected.
		</div>
	{:else}
		<div class="grid gap-5 sm:grid-cols-2">
			{#each showcaseEntries as entry (entry.url)}
				<article class="rounded-lg border p-6">
					<h2 class="text-xl font-semibold">
						<a href={entry.url} target="_blank" rel="noopener noreferrer">{entry.name}</a>
					</h2>
					<p class="mt-3 text-sm leading-6 text-muted-foreground">{entry.description}</p>
					{#if entry.repository}
						<a
							class="mt-4 inline-block text-sm underline"
							href={entry.repository}
							target="_blank"
							rel="noopener noreferrer">Source</a
						>
					{/if}
				</article>
			{/each}
		</div>
	{/if}
</PublicPageShell>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
