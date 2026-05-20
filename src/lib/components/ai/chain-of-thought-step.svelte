<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { DotIcon } from '@lucide/svelte';
	import { cn } from '$lib/utils.js';

	let {
		class: className,
		icon: Icon = DotIcon,
		label,
		description,
		status = 'complete' as 'complete' | 'active' | 'pending',
		children
	}: HTMLAttributes<HTMLDivElement> & {
		icon?: typeof DotIcon;
		label: Snippet | string;
		description?: Snippet | string;
		status?: 'complete' | 'active' | 'pending';
	} = $props();

	const statusStyles: Record<string, string> = {
		active: 'text-foreground',
		complete: 'text-muted-foreground',
		pending: 'text-muted-foreground/50'
	};
</script>

<div
	class={cn(
		'flex gap-2 text-sm',
		statusStyles[status],
		'animate-in fade-in-0 slide-in-from-top-2',
		className
	)}
>
	<div class="relative mt-0.5">
		<Icon class="size-4" />
		<div class="absolute top-7 bottom-0 left-1/2 -mx-px w-px bg-border"></div>
	</div>
	<div class="flex-1 space-y-2 overflow-hidden">
		{#if typeof label === 'string'}
			<div>{label}</div>
		{:else}
			{@render label()}
		{/if}
		{#if description}
			<div class="text-xs text-muted-foreground">
				{#if typeof description === 'string'}
					{description}
				{:else}
					{@render description()}
				{/if}
			</div>
		{/if}
		{@render children?.()}
	</div>
</div>
