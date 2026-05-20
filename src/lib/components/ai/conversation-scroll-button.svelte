<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowDownIcon } from '@lucide/svelte';
	import { cn } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';

	let {
		class: className,
		isAtBottom,
		scrollToBottom,
		...restProps
	}: ComponentProps<typeof Button> & {
		isAtBottom: boolean;
		scrollToBottom: () => void;
	} = $props();
</script>

{#if !isAtBottom}
	<Button
		class={cn(
			'absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full dark:bg-background dark:hover:bg-muted',
			className
		)}
		onclick={scrollToBottom}
		size="icon"
		type="button"
		variant="outline"
		{...restProps}
	>
		<ArrowDownIcon class="size-4" />
	</Button>
{/if}
