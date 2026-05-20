<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { CornerDownLeftIcon, SquareIcon, XIcon } from '@lucide/svelte';
	import { cn } from '$lib/utils.js';
	import type { ChatStatus } from 'ai';
	import type { ComponentProps } from 'svelte';

	let {
		class: className,
		variant = 'default' as ComponentProps<typeof InputGroup.Button>['variant'],
		size = 'icon-sm' as ComponentProps<typeof InputGroup.Button>['size'],
		status,
		onStop,
		onClick,
		children,
		...restProps
	}: ComponentProps<typeof InputGroup.Button> & {
		status?: ChatStatus;
		onStop?: () => void;
		onClick?: (e: MouseEvent) => void;
	} = $props();

	const isGenerating = $derived(status === 'submitted' || status === 'streaming');

	function handleClick(e: MouseEvent) {
		if (isGenerating && onStop) {
			e.preventDefault();
			onStop();
			return;
		}
		onClick?.(e);
	}
</script>

<InputGroup.Button
	aria-label={isGenerating ? 'Stop' : 'Submit'}
	class={cn(className)}
	onclick={handleClick}
	{size}
	type={isGenerating && onStop ? 'button' : 'submit'}
	{variant}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else if status === 'submitted'}
		<div
			class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
		></div>
	{:else if status === 'streaming'}
		<SquareIcon class="size-4" />
	{:else if status === 'error'}
		<XIcon class="size-4" />
	{:else}
		<CornerDownLeftIcon class="size-4" />
	{/if}
</InputGroup.Button>
