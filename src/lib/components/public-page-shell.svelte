<script lang="ts">
	import type { Snippet } from 'svelte';
	import LandingFooter from '$lib/components/landing/landing-footer.svelte';
	import LandingNav from '$lib/components/landing/landing-nav.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<a
	href="#main-content"
	class="sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[160] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-lg"
>
	Skip to content
</a>

<div class="flex min-h-screen flex-col bg-background text-foreground">
	<LandingNav />
	<div class="flex-1">
		{@render children()}
	</div>
	<LandingFooter />
</div>
