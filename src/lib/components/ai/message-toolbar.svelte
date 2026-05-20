<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn('mt-4 flex w-full items-center justify-between gap-4', className)} {...restProps}>
	{@render children?.()}
</div>
