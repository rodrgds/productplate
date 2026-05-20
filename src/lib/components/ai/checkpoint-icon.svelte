<script lang="ts">
	import { BookmarkIcon } from '@lucide/svelte';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {
		class: className,
		children,
		...restProps
	}: HTMLAttributes<SVGSVGElement> & {
		children?: Snippet;
	} = $props();
</script>

{#if children}
	{@render children()}
{:else}
	<BookmarkIcon class={cn('size-4 shrink-0', className)} {...restProps} />
{/if}
