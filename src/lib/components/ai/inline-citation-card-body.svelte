<script lang="ts">
	import * as HoverCard from '$lib/components/ui/hover-card/index.js';
	import { cn } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';

	let {
		class: className,
		children,
		...restProps
	}: ComponentProps<typeof HoverCard.Content> = $props();
</script>

<HoverCard.Content class={cn('relative w-80 p-0', className)} {...restProps}>
	{@render children?.()}
</HoverCard.Content>
