<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLSpanElement> = $props();
</script>

<span class={cn('transition-colors group-hover:bg-accent', className)} {...restProps}>
	{@render children?.()}
</span>
