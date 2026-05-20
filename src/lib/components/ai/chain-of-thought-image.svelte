<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		class: className,
		caption,
		children,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		caption?: string;
	} = $props();
</script>

<div class={cn('mt-2 space-y-2', className)} {...restProps}>
	<div
		class="relative flex max-h-[22rem] items-center justify-center overflow-hidden rounded-lg bg-muted p-3"
	>
		{@render children?.()}
	</div>
	{#if caption}
		<p class="text-xs text-muted-foreground">{caption}</p>
	{/if}
</div>
