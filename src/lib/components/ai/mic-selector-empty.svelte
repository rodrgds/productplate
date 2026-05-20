<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import type { Snippet } from 'svelte';

	let { children, ...restProps }: { children?: Snippet | string } & Record<string, unknown> =
		$props();
</script>

<Command.Empty {...restProps}>
	{#if children}
		{#if typeof children === 'string'}
			{children}
		{:else}
			{@render children()}
		{/if}
	{:else}
		No microphone found.
	{/if}
</Command.Empty>
