<script lang="ts">
	import { APP_NAME, APP_URL } from '$lib/constants.js';
	import type { PageData } from './$types';
	import PublicPageShell from '$lib/components/public-page-shell.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Changelog | {APP_NAME}</title>
	<meta
		name="description"
		content="Product Plate release notes and starter-template improvements."
	/>
	<link rel="canonical" href={`${APP_URL}/changelog`} />
</svelte:head>

<PublicPageShell>
	<main id="main-content" class="mx-auto max-w-4xl px-6 py-16">
		<div class="mb-10 space-y-3">
			<p class="text-sm font-medium text-primary">Changelog</p>
			<h1 class="text-4xl font-semibold tracking-tight">What changed</h1>
		</div>
		<div class="space-y-6">
			{#each data.releases as release (release.version)}
				<article class="rounded-lg border bg-card p-6">
					<div class="flex flex-wrap items-baseline gap-3">
						<span
							class="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
							>{release.version}</span
						>
						{#if release.date}
							<time datetime={release.date} class="text-sm text-muted-foreground"
								>{release.date}</time
							>
						{/if}
					</div>
					<div class="mt-5 grid gap-5">
						{#each release.groups as group (group.title)}
							{#if group.items.length > 0}
								<section>
									<h2 class="font-semibold">{group.title}</h2>
									<ul class="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
										{#each group.items as item (item)}
											<li>{item}</li>
										{/each}
									</ul>
								</section>
							{/if}
						{/each}
					</div>
				</article>
			{/each}
		</div>
	</main>
</PublicPageShell>
