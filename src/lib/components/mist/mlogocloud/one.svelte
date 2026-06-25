<script lang="ts">
	const stack = [
		{ name: 'SvelteKit', logo: 'https://cdn.simpleicons.org/svelte/FF3E00', initials: null },
		{ name: 'TypeScript', logo: 'https://cdn.simpleicons.org/typescript/3178C6', initials: null },
		{ name: 'Tailwind CSS', logo: 'https://cdn.simpleicons.org/tailwindcss/06B6D4', initials: null },
		{ name: 'Bun', logo: 'https://cdn.simpleicons.org/bun/000000', initials: null },
		{ name: 'Cloudflare', logo: 'https://cdn.simpleicons.org/cloudflare/F38020', initials: null },
		{ name: 'Convex', logo: null, initials: 'CX' },
		{ name: 'Better Auth', logo: null, initials: 'BA' },
		{ name: 'Autumn', logo: null, initials: 'AU' },
		{ name: 'AI SDK', logo: null, initials: 'AI' }
	] as const;
</script>

<section aria-label="Technology stack" class="border-y bg-muted/25">
	<div class="mx-auto max-w-6xl px-6 py-8">
		<div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
			<p class="shrink-0 text-sm font-medium text-muted-foreground">Default stack</p>
			<ul class="flex flex-wrap items-center gap-2.5">
				{#each stack as item (item.name)}
					<li
						class="flex items-center gap-2 rounded-full border bg-background px-3 py-2 text-sm font-medium shadow-sm"
					>
						{#if item.logo}
							<img src={item.logo} alt="" class="size-4" loading="lazy" />
						{:else}
							<span
								class="flex size-4 items-center justify-center rounded-sm bg-primary text-[0.52rem] font-bold text-primary-foreground"
								>{item.initials}</span
							>
						{/if}
						<span>{item.name}</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>
