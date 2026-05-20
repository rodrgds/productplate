<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		defaultOpen = true,
		open,
		onOpenChange,
		class: className,
		children,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		defaultOpen?: boolean;
		open?: boolean;
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
</script>

<Collapsible.Root
	class={cn(className)}
	open={isOpen}
	onOpenChange={handleOpenChange}
	{...restProps}
>
	{@render children?.()}
</Collapsible.Root>
