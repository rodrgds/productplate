<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import LayersIcon from '@lucide/svelte/icons/layers-3';
	import LandingNav from '$lib/components/landing/landing-nav.svelte';
	import LandingFooter from '$lib/components/landing/landing-footer.svelte';
	import { Button } from '$lib/components/ui/button';
	import { categories, getCategory } from '../registry';

	let current = $derived(getCategory(page.params.category ?? ''));
</script>

<svelte:head>
	<title>{current ? `${current.title} components` : 'Components'} | Product Plate</title>
	<meta
		name="description"
		content={current ? current.blurb : 'Browse landing page component variants for Product Plate.'}
	/>
</svelte:head>

<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg"
>
	Skip to content
</a>

<div class="min-h-screen bg-background text-foreground">
	<LandingNav active="components" />

	<main id="main-content">
		{#if current}
			<section class="border-b">
				<div class="mx-auto max-w-7xl px-6 py-10">
					<nav class="category-nav" aria-label="Component categories">
						<a href={resolve('/components')} class="category-tab category-tab-index">
							<ArrowLeftIcon class="size-3.5" />
							Index
						</a>
						{#each categories as category (category.id)}
							<a
								href={resolve(`/components/${category.id}`)}
								class="category-tab"
								class:category-tab-active={category.id === current.id}
								aria-current={category.id === current.id ? 'page' : undefined}
							>
								{category.title}
							</a>
						{/each}
					</nav>

					<div class="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end">
						<div class="max-w-2xl">
							<p class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
								<LayersIcon class="size-4" />
								{current.components.length} variant{current.components.length === 1 ? '' : 's'}
							</p>
							<h1 class="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
								{current.title} components
							</h1>
							<p class="mt-3 text-base leading-7 text-muted-foreground">{current.blurb}</p>
						</div>
						<div class="category-summary">
							<p>Source path</p>
							<code>src/lib/components/landing</code>
						</div>
					</div>
				</div>
			</section>

			{#each current.components as entry, index (entry.key)}
				{@const Component = entry.Component}
				<section class="variant" aria-labelledby={`${entry.key}-heading`}>
					<div class="variant-toolbar">
						<div>
							<p>Variant {index + 1} of {current.components.length}</p>
							<h2 id={`${entry.key}-heading`}>{entry.label}</h2>
						</div>
						<Button href={resolve('/auth/demo')} variant="outline" size="sm">Open demo</Button>
					</div>
					<div class="variant-preview">
						<Component />
					</div>
				</section>
			{/each}
		{:else}
			<section class="py-32">
				<div class="mx-auto max-w-2xl px-6 text-center">
					<h1 class="text-2xl font-semibold tracking-tight">Category not found</h1>
					<p class="mt-3 text-muted-foreground">
						That category does not exist. Pick one from the index.
					</p>
					<a
						href={resolve('/components')}
						class="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
					>
						Back to components
					</a>
				</div>
			</section>
		{/if}
	</main>

	<LandingFooter />
</div>

<style>
	.category-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.category-tab {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--card);
		padding: 0.4rem 0.9rem;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--muted-foreground);
		transition:
			color 140ms ease,
			border-color 140ms ease,
			background-color 140ms ease;
	}

	.category-tab:hover {
		color: var(--foreground);
		border-color: color-mix(in oklch, var(--foreground) 22%, transparent);
	}

	.category-tab-active,
	.category-tab-active:hover {
		color: var(--primary-foreground);
		background: var(--primary);
		border-color: var(--primary);
	}

	.category-tab-index {
		color: var(--foreground);
	}

	.category-summary {
		display: grid;
		gap: 0.35rem;
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		background: var(--muted);
		padding: 1rem;
	}

	.category-summary p {
		margin: 0;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--muted-foreground);
	}

	.category-summary code {
		width: fit-content;
		border-radius: 0.45rem;
		background: var(--background);
		padding: 0.25rem 0.45rem;
		font-size: 0.8rem;
	}

	.variant {
		border-bottom: 1px solid var(--border);
	}

	.variant-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0 max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem));
		min-height: 5.5rem;
		background: var(--background);
	}

	.variant-toolbar p {
		margin: 0;
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--muted-foreground);
	}

	.variant-toolbar h2 {
		margin: 0.25rem 0 0;
		font-size: 1rem;
		font-weight: 650;
	}

	.variant-preview {
		background: var(--background);
	}

	@media (max-width: 640px) {
		.variant-toolbar {
			align-items: flex-start;
			flex-direction: column;
			padding-top: 1.25rem;
			padding-bottom: 1.25rem;
		}
	}
</style>
