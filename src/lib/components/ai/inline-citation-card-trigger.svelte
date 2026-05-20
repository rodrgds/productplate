<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as HoverCard from '$lib/components/ui/hover-card/index.js';
	import { cn } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';

	let {
		sources,
		class: className,
		...restProps
	}: ComponentProps<typeof Badge> & {
		sources: string[];
	} = $props();
</script>

<HoverCard.Trigger>
	<Badge class={cn('ml-1 rounded-full', className)} variant="secondary" {...restProps}>
		{#if sources[0]}
			{new URL(sources[0]).hostname}
			{#if sources.length > 1}
				+{sources.length - 1}
			{/if}
		{:else}
			unknown
		{/if}
	</Badge>
</HoverCard.Trigger>
