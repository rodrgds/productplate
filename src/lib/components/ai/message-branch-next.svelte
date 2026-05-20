<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { ChevronRightIcon } from '@lucide/svelte';
	import { useMessageBranch } from './message-branch.svelte';
	import type { ComponentProps } from 'svelte';

	let { children, ...restProps }: ComponentProps<typeof Button> = $props();

	const { goToNext, totalBranches } = useMessageBranch();
</script>

<Button
	aria-label="Next branch"
	disabled={totalBranches <= 1}
	onclick={goToNext}
	size="icon-sm"
	type="button"
	variant="ghost"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<ChevronRightIcon size={14} />
	{/if}
</Button>
