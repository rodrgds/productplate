<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useChainOfThought } from './chain-of-thought.svelte';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();

	const { isOpen } = useChainOfThought();
</script>

<Collapsible.Root open={isOpen}>
	<Collapsible.Content
		class={cn(
			'mt-2 space-y-3',
			'text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2',
			className
		)}
		{...restProps}
	>
		{@render children?.()}
	</Collapsible.Content>
</Collapsible.Root>
