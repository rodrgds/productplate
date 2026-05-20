<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';

	let {
		class: className,
		title = 'No messages yet',
		description = 'Start a conversation to see messages here',
		icon,
		children
	}: HTMLAttributes<HTMLDivElement> & {
		title?: string;
		description?: string;
		icon?: Snippet;
	} = $props();
</script>

<div
	class={cn('flex size-full flex-col items-center justify-center gap-3 p-8 text-center', className)}
>
	{#if children}
		{@render children()}
	{:else}
		{#if icon}
			<div class="text-muted-foreground">
				{@render icon()}
			</div>
		{/if}
		<div class="space-y-1">
			<h3 class="text-sm font-medium">{title}</h3>
			{#if description}
				<p class="text-sm text-muted-foreground">{description}</p>
			{/if}
		</div>
	{/if}
</div>
