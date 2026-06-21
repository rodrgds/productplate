<script lang="ts">
	const stack = ['SvelteKit', 'Convex', 'Better Auth', 'Autumn', 'Tailwind CSS', 'AI SDK'] as const;
</script>

<section aria-label="Technology stack" class="border-y">
	<div
		class="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between"
	>
		<p class="shrink-0 text-sm font-medium text-muted-foreground">Built on tools you can trust</p>
		<ul class="flex flex-wrap items-center gap-x-7 gap-y-3">
			{#each stack as item (item)}
				<li class="text-sm font-semibold tracking-tight">{item}</li>
			{/each}
		</ul>
	</div>
</section>
