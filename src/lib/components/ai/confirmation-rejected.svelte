<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useConfirmation } from './confirmation.svelte';

	let { children }: { children?: Snippet } = $props();
	const { approval, state } = useConfirmation();
</script>

{#if approval?.approved === false && (state === 'approval-responded' || state === 'output-denied' || state === 'output-available')}
	{@render children?.()}
{/if}
