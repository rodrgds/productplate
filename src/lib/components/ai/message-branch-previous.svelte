<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { ChevronLeftIcon } from '@lucide/svelte';
	import { useMessageBranch } from './message-branch.svelte';
	import type { ComponentProps } from 'svelte';

	let { children, ...restProps }: ComponentProps<typeof Button> = $props();

	const { goToPrevious, totalBranches } = useMessageBranch();
</script>

<Button
	aria-label="Previous branch"
	disabled={totalBranches <= 1}
	onclick={goToPrevious}
	size="icon-sm"
	type="button"
	variant="ghost"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<ChevronLeftIcon size={14} />
	{/if}
</Button>
