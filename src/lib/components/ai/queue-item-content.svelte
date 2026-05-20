<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		completed = false,
		class: className,
		children,
		...restProps
	}: HTMLAttributes<HTMLSpanElement> & {
		completed?: boolean;
	} = $props();
</script>

<span
	class={cn(
		'line-clamp-1 grow break-words',
		completed ? 'text-muted-foreground/50 line-through' : 'text-muted-foreground',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</span>
