<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		title,
		url,
		description,
		class: className,
		children,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		title?: string;
		url?: string;
		description?: string;
	} = $props();
</script>

<div class={cn('space-y-1', className)} {...restProps}>
	{#if title}
		<h4 class="truncate text-sm leading-tight font-medium">{title}</h4>
	{/if}
	{#if url}
		<p class="truncate text-xs break-all text-muted-foreground">{url}</p>
	{/if}
	{#if description}
		<p class="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
	{/if}
	{@render children?.()}
</div>
