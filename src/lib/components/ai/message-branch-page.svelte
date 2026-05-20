<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useMessageBranch } from './message-branch.svelte';
	import { cn } from '$lib/utils.js';

	let { class: className, ...restProps }: HTMLAttributes<HTMLSpanElement> = $props();

	const { currentBranch, totalBranches } = useMessageBranch();
</script>

<span
	class={cn('border-none bg-transparent text-muted-foreground shadow-none', className)}
	{...restProps}
>
	{currentBranch + 1} of {totalBranches}
</span>
