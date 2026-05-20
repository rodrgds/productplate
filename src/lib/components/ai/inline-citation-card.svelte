<script lang="ts">
	import * as HoverCard from '$lib/components/ui/hover-card/index.js';
	import type { ComponentProps } from 'svelte';

	let {
		openDelay = 0,
		closeDelay = 0,
		children,
		...restProps
	}: ComponentProps<typeof HoverCard.Root> = $props();
</script>

<HoverCard.Root {closeDelay} {openDelay} {...restProps}>
	{@render children?.()}
</HoverCard.Root>
