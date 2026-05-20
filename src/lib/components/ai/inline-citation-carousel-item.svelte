<script lang="ts">
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<Carousel.Item class={cn('w-full space-y-2 p-4 pl-8', className)} {...restProps}>
	{@render children?.()}
</Carousel.Item>
