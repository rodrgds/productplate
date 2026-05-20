<script lang="ts">
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<Carousel.Root class={cn('w-full', className)} {...restProps}>
	{@render children?.()}
</Carousel.Root>
