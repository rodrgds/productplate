<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ChevronsUpDownIcon } from '@lucide/svelte';
	import { useMicSelector } from './ai-contexts.js';
	import type { ComponentProps } from 'svelte';

	let { children, ...restProps }: ComponentProps<typeof Button> = $props();

	const { setWidth } = useMicSelector();
	let wrapper: HTMLDivElement | null = $state(null);

	$effect(() => {
		if (!wrapper) return;
		setWidth(wrapper.offsetWidth);
	});
</script>

<div bind:this={wrapper} class="inline-flex">
	<Popover.Trigger>
		<Button variant="outline" {...restProps}>
			{@render children?.()}
			<ChevronsUpDownIcon class="shrink-0 text-muted-foreground" size={16} />
		</Button>
	</Popover.Trigger>
</div>
