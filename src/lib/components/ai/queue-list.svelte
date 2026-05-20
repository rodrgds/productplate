<script lang="ts">
	import * as ScrollArea from '$lib/components/ui/scroll-area/index.js';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<ScrollArea.Root class={cn('mt-2 -mb-1', className)} {...restProps}>
	<div class="max-h-40 pr-4">
		<ul>
			{@render children?.()}
		</ul>
	</div>
</ScrollArea.Root>
