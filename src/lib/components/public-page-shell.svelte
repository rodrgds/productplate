<script lang="ts">
	import type { Snippet } from 'svelte';
	import LandingFooter from '$lib/components/landing/landing-footer.svelte';
	import LandingNav from '$lib/components/landing/landing-nav.svelte';

	interface Props {
		children: Snippet;
		title?: string;
		eyebrow?: string;
		description?: string;
	}

	let { children, title, eyebrow, description }: Props = $props();
</script>

<a
	href="#main-content"
	class="sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[160] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-lg"
>
	Skip to content
</a>

<div class="flex min-h-screen flex-col bg-background text-foreground">
	<LandingNav />
	<div id="main-content" class="flex-1">
		{#if title}
			<header class="mx-auto max-w-5xl px-6 pt-16 pb-10 sm:pt-24">
				{#if eyebrow}<p class="text-sm font-medium text-primary">{eyebrow}</p>{/if}
				<h1 class="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
				{#if description}<p class="mt-4 max-w-2xl text-lg text-muted-foreground">
						{description}
					</p>{/if}
			</header>
		{/if}
		{@render children()}
	</div>
	<LandingFooter />
</div>
