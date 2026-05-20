<script lang="ts" module>
	import { getContext } from 'svelte';

	interface ChainOfThoughtContextValue {
		isOpen: boolean;
		setIsOpen: (open: boolean) => void;
	}

	export const chainOfThoughtKey = Symbol('chain-of-thought');

	export function useChainOfThought(): ChainOfThoughtContextValue {
		const context = getContext(chainOfThoughtKey) as ChainOfThoughtContextValue | null;
		if (!context) {
			throw new Error('ChainOfThought components must be used within ChainOfThought');
		}
		return context;
	}
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { setContext } from 'svelte';
	import { cn } from '$lib/utils.js';

	let {
		class: className,
		open,
		defaultOpen = false,
		onOpenChange,
		children
	}: HTMLAttributes<HTMLDivElement> & {
		open?: boolean;
		defaultOpen?: boolean;
		onOpenChange?: (open: boolean) => void;
	} = $props();

	let isOpen = $state(open ?? defaultOpen);

	$effect(() => {
		if (open !== undefined) {
			isOpen = open;
		}
	});

	function handleOpenChange(value: boolean) {
		isOpen = value;
		onOpenChange?.(value);
	}

	setContext(chainOfThoughtKey, {
		get isOpen() {
			return isOpen;
		},
		setIsOpen: handleOpenChange
	});
</script>

<div class={cn('not-prose w-full space-y-4', className)}>
	{@render children?.()}
</div>
