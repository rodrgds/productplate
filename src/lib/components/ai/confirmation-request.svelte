<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useConfirmation } from './confirmation.svelte';

	let { children }: { children?: Snippet } = $props();
	const { state } = useConfirmation();
</script>

{#if state === 'approval-requested'}
	{@render children?.()}
{/if}
