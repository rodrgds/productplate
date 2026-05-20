<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { useMessageBranch } from './message-branch.svelte';
	import { cn } from '$lib/utils.js';

	let { children = [] as Snippet<[number]>[] }: HTMLAttributes<HTMLDivElement> = $props();

	const { currentBranch, setTotalBranches } = useMessageBranch();

	$effect(() => {
		setTotalBranches(children.length);
	});
</script>

{#each children as branch, index (index)}
	<div
		class={cn(
			'grid gap-2 overflow-hidden [&>div]:pb-0',
			index === currentBranch ? 'block' : 'hidden'
		)}
	>
		{@render branch(index)}
	</div>
{/each}
