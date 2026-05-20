<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		class: className,
		duration = 1.5,
		children,
		...restProps
	}: HTMLAttributes<HTMLSpanElement> & {
		duration?: number;
	} = $props();
</script>

<span
	class={cn('inline-flex items-center gap-1', 'relative overflow-hidden', className)}
	{...restProps}
>
	{@render children?.()}
	<span
		class="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"
		style="animation-duration: {duration}s"
	></span>
</span>
