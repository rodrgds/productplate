<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';

	let {
		suggestion,
		onClick,
		class: className,
		variant = 'outline' as ComponentProps<typeof Button>['variant'],
		size = 'sm' as ComponentProps<typeof Button>['size'],
		children,
		...restProps
	}: Omit<ComponentProps<typeof Button>, 'onclick'> & {
		suggestion: string;
		onClick?: (suggestion: string) => void;
	} = $props();

	function handleClick() {
		onClick?.(suggestion);
	}
</script>

<Button
	class={cn('cursor-pointer rounded-full px-4', className)}
	onclick={handleClick}
	{size}
	type="button"
	{variant}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		{suggestion}
	{/if}
</Button>
