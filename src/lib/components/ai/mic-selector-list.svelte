<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import { useMicSelector } from './ai-contexts.js';
	import type { Snippet } from 'svelte';
	import type { ComponentProps } from 'svelte';

	let {
		children,
		...restProps
	}: ComponentProps<typeof Command.List> & {
		children: Snippet<[MediaDeviceInfo[]]>;
	} = $props();

	const { devices } = useMicSelector();
</script>

<Command.List {...restProps}>
	{@render children(devices)}
</Command.List>
