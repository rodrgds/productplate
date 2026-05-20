<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { useMicSelector } from './ai-contexts.js';
	import { cn } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';

	let {
		class: className,
		popoverOptions,
		children,
		...restProps
	}: ComponentProps<typeof Command.Root> & {
		popoverOptions?: ComponentProps<typeof Popover.Content>;
	} = $props();

	const { width, onValueChange, value } = useMicSelector();
</script>

<Popover.Content class={cn('p-0', className)} style="width: {width}px;" {...popoverOptions}>
	<Command.Root {onValueChange} {value} {...restProps}>
		{@render children?.()}
	</Command.Root>
</Popover.Content>
