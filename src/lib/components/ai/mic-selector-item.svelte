<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import { useMicSelector } from './ai-contexts.js';
	import type { ComponentProps } from 'svelte';

	let {
		value,
		...restProps
	}: ComponentProps<typeof Command.Item> & {
		value: string;
	} = $props();

	const { onValueChange, onOpenChange } = useMicSelector();

	function handleSelect() {
		onValueChange(value);
		onOpenChange(false);
	}
</script>

<Command.Item {value} onSelect={handleSelect} {...restProps} />
