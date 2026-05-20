<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';

	let {
		class: className,
		children,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		children?: Snippet;
	} = $props();
</script>

<div
	class={cn('flex items-center justify-center p-4 text-sm text-muted-foreground', className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		No attachments
	{/if}
</div>
