<script lang="ts">
	import * as ScrollArea from '$lib/components/ui/scroll-area/index.js';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<ScrollArea.Root class="w-full overflow-x-auto whitespace-nowrap" {...restProps}>
	<div class={cn('flex w-max flex-nowrap items-center gap-2', className)}>
		{@render children?.()}
	</div>
</ScrollArea.Root>
