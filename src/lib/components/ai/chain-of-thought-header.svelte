<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { BrainIcon, ChevronDownIcon } from '@lucide/svelte';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { cn } from '$lib/utils.js';
	import { useChainOfThought } from './chain-of-thought.svelte';

	let {
		class: className,
		children
	}: HTMLAttributes<HTMLButtonElement> & {
		children?: Snippet;
	} = $props();

	const { isOpen, setIsOpen } = useChainOfThought();
</script>

<Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
	<Collapsible.Trigger
		class={cn(
			'flex w-full items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground',
			className
		)}
	>
		<BrainIcon class="size-4" />
		<span class="flex-1 text-left">
			{#if children}
				{@render children()}
			{:else}
				Chain of Thought
			{/if}
		</span>
		<ChevronDownIcon
			class={cn('size-4 transition-transform', isOpen ? 'rotate-180' : 'rotate-0')}
		/>
	</Collapsible.Trigger>
</Collapsible.Root>
