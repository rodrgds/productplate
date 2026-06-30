<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import BoxesIcon from '@lucide/svelte/icons/boxes';
	import CodeIcon from '@lucide/svelte/icons/code-2';
	import LayoutTemplateIcon from '@lucide/svelte/icons/layout-template';
	import { resolve } from '$app/paths';
	import LandingNav from '$lib/components/landing/landing-nav.svelte';
	import LandingFooter from '$lib/components/landing/landing-footer.svelte';
	import { Button } from '$lib/components/ui/button';
	import { APP_DESCRIPTION, APP_NAME } from '$lib/constants';
	import { categories } from './registry';

	const componentCount = categories.reduce(
		(total, category) => total + category.components.length,
		0
	);
	const featuredCategories = categories.slice(0, 4);

	const to = {
		home: resolve('/'),
		hero: resolve('/components/hero')
	};
</script>

<svelte:head>
	<title>Components | {APP_NAME}</title>
	<meta name="description" content={APP_DESCRIPTION} />
</svelte:head>

<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg"
>
	Skip to content
</a>

<div class="min-h-screen bg-background text-foreground">
	<LandingNav />

	<main id="main-content">
		<section class="border-b bg-muted/30 py-16 sm:py-20">
			<div
				class="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end"
			>
				<div class="max-w-3xl">
					<p class="text-sm font-medium text-muted-foreground">Component library</p>
					<h1 class="mt-4 max-w-2xl text-3xl font-semibold text-balance sm:text-4xl">
						Reusable landing sections
					</h1>
					<p class="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
						Browse the source-owned Svelte sections that ship with {APP_NAME}. They are meant to be
						copied, removed, and reshaped during kickstart instead of treated as a locked theme.
					</p>
					<div class="mt-6 flex flex-wrap gap-3">
						<Button href={to.hero} size="lg">
							Browse variants
							<ArrowRightIcon data-icon="inline-end" />
						</Button>
						<Button href={to.home} variant="outline" size="lg">Back to landing page</Button>
					</div>
				</div>

				<div class="library-panel" aria-label="Landing component inventory">
					<div class="library-metric">
						<BoxesIcon class="size-4" />
						<span>{componentCount} sections</span>
					</div>
					<div class="library-metric">
						<LayoutTemplateIcon class="size-4" />
						<span>{categories.length} categories</span>
					</div>
					<div class="library-metric">
						<CodeIcon class="size-4" />
						<span>Plain Svelte files</span>
					</div>
				</div>
			</div>
		</section>

		<section class="py-14 sm:py-16">
			<div class="mx-auto max-w-7xl px-6">
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{#each featuredCategories as category (category.id)}
						<a href={resolve(`/components/${category.id}`)} class="featured-card">
							<span>{category.title}</span>
							<ArrowRightIcon class="size-4" />
						</a>
					{/each}
				</div>

				<div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each categories as category (category.id)}
						<a href={resolve(`/components/${category.id}`)} class="category-card">
							<div class="category-card-top">
								<h2>{category.title}</h2>
								<ArrowRightIcon class="size-4 transition-transform" />
							</div>
							<p class="category-blurb">{category.blurb}</p>
							<p class="category-count">
								{category.components.length} variant{category.components.length === 1 ? '' : 's'}
							</p>
						</a>
					{/each}
				</div>
			</div>
		</section>
	</main>

	<LandingFooter />
</div>

<style>
	.library-panel {
		display: grid;
		gap: 0.6rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--background);
		padding: 1rem;
		box-shadow: 0 1px 2px color-mix(in oklch, var(--foreground) 5%, transparent);
	}

	.library-metric {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border-radius: 0.75rem;
		background: var(--muted);
		padding: 0.85rem 0.95rem;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--foreground);
	}

	.library-metric :global(svg) {
		color: var(--primary);
	}

	.featured-card {
		display: flex;
		min-height: 4rem;
		align-items: center;
		justify-content: space-between;
		border: 1px solid var(--border);
		border-radius: 0.85rem;
		background: var(--card);
		padding: 1rem;
		font-size: 0.9rem;
		font-weight: 650;
		transition:
			border-color 140ms ease,
			background-color 140ms ease;
	}

	.featured-card:hover {
		border-color: color-mix(in oklch, var(--primary) 55%, var(--border));
		background: color-mix(in oklch, var(--primary) 8%, var(--card));
	}

	.category-card {
		display: grid;
		gap: 0.7rem;
		content-visibility: auto;
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		background: var(--card);
		padding: 1.5rem;
		box-shadow: 0 1px 2px color-mix(in oklch, var(--foreground) 5%, transparent);
		transition:
			border-color 140ms ease,
			box-shadow 140ms ease;
	}

	.category-card:hover {
		border-color: color-mix(in oklch, var(--foreground) 22%, transparent);
		box-shadow: 0 8px 24px color-mix(in oklch, var(--foreground) 8%, transparent);
	}

	.category-card:hover :global([data-icon='inline-end']) {
		transform: translateX(2px);
	}

	.category-card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.category-card h2 {
		margin: 0;
		font-size: 1rem;
		font-weight: 650;
	}

	.category-blurb {
		color: var(--muted-foreground);
		font-size: 0.92rem;
		line-height: 1.6;
	}

	.category-count {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--muted-foreground);
	}
</style>
