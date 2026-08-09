<script lang="ts">
	type StackItem = {
		name: string;
		logo: string;
	};

	const stack: readonly StackItem[] = [
		{ name: 'SvelteKit', logo: '/stack/svelte.svg' },
		{ name: 'TypeScript', logo: '/stack/typescript.svg' },
		{ name: 'Tailwind CSS', logo: '/stack/tailwindcss.svg' },
		{ name: 'Bun', logo: '/stack/bun.svg' },
		{ name: 'Cloudflare', logo: '/stack/cloudflare.svg' },
		{ name: 'Convex', logo: '/stack/convex.png' },
		{ name: 'Better Auth', logo: '/stack/better-auth.svg' },
		{ name: 'Autumn', logo: '/stack/autumn.svg' },
		{ name: 'AI SDK', logo: '/stack/aisdk.png' }
	] as const;
</script>

<section aria-label="Technology stack" class="border-y bg-muted/25">
	<div class="mx-auto max-w-6xl px-6 py-8">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
			<p class="shrink-0 text-sm font-medium text-muted-foreground">Default stack</p>
			<ul class="flex flex-wrap items-baseline gap-x-5 gap-y-2.5 sm:justify-end">
				{#each stack as item (item.name)}
					<li class="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
						<img src={item.logo} alt="" class="size-3.5 shrink-0" loading="lazy" />
						<span>{item.name}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	:global(html.dark) img[src$='/better-auth.svg'] {
		filter: invert(1);
	}
</style>
