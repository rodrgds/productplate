<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();

	let scrollContainer = $state<HTMLDivElement | null>(null);
	function handleScroll() {
		if (!scrollContainer) return;
	}
</script>

<div class={cn('relative flex-1 overflow-y-hidden', className)} {...restProps}>
	<div
		bind:this={scrollContainer}
		class="h-full overflow-y-auto"
		onscroll={handleScroll}
		role="log"
	>
		<div class="flex flex-col gap-8 p-4">
			{@render children?.()}
		</div>
	</div>
</div>
