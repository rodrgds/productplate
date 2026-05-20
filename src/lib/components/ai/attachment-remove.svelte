<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	import { Button } from '$lib/components/ui/button/index.js';
	import { XIcon } from '@lucide/svelte';
	import { cn } from '$lib/utils.js';
	import { useAttachmentContext } from './attachment-utils.js';

	let {
		label = 'Remove',
		class: className,
		children,
		...restProps
	}: HTMLAttributes<HTMLButtonElement> & {
		label?: string;
	} = $props();

	const { onRemove, variant } = useAttachmentContext();

	function handleClick(e: MouseEvent) {
		e.stopPropagation();
		onRemove?.();
	}
</script>

{#if onRemove}
	<Button
		type="button"
		variant="ghost"
		aria-label={label}
		class={cn(
			variant === 'grid' && [
				'absolute top-2 right-2 size-6 rounded-full p-0',
				'bg-background/80 backdrop-blur-sm',
				'opacity-0 transition-opacity group-hover:opacity-100',
				'hover:bg-background',
				'[&>svg]:size-3'
			],
			variant === 'inline' && [
				'size-5 rounded p-0',
				'opacity-0 transition-opacity group-hover:opacity-100',
				'[&>svg]:size-2.5'
			],
			variant === 'list' && ['size-8 shrink-0 rounded p-0', '[&>svg]:size-4'],
			className
		)}
		onclick={handleClick}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{:else}
			<XIcon />
		{/if}
		<span class="sr-only">{label}</span>
	</Button>
{/if}
