<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useConfirmation } from './confirmation.svelte';
	import { cn } from '$lib/utils.js';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();

	const { state } = useConfirmation();
</script>

{#if state === 'approval-requested'}
	<div class={cn('flex items-center justify-end gap-2 self-end', className)} {...restProps}>
		{@render children?.()}
	</div>
{/if}
