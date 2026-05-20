<script lang="ts">
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let { children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<Carousel.Content {...restProps}>
	{@render children?.()}
</Carousel.Content>
