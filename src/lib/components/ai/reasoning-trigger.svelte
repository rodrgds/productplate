<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { BrainIcon, ChevronDownIcon } from '@lucide/svelte';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { cn } from '$lib/utils.js';
	import { useReasoning } from './reasoning.svelte';

	let {
		class: className,
		getThinkingMessage = defaultGetThinkingMessage,
		children
	}: HTMLAttributes<HTMLButtonElement> & {
		getThinkingMessage?: (isStreaming: boolean, duration?: number) => string;
	} = $props();

	const { isStreaming, isOpen, duration } = useReasoning();

	function defaultGetThinkingMessage(isStreaming: boolean, duration?: number): string {
		if (isStreaming || duration === 0) {
			return 'Thinking...';
		}
		if (duration === undefined) {
			return 'Thought for a few seconds';
		}
		return `Thought for ${duration} seconds`;
	}
</script>

<Collapsible.Trigger
	class={cn(
		'flex w-full items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground',
		className
	)}
>
	{#if children}
		{@render children()}
	{:else}
		<BrainIcon class="size-4" />
		{@const message = getThinkingMessage(isStreaming, duration)}
		<p>{message}</p>
		<ChevronDownIcon
			class={cn('size-4 transition-transform', isOpen ? 'rotate-180' : 'rotate-0')}
		/>
	{/if}
</Collapsible.Trigger>
