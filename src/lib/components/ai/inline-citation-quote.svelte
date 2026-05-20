<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLQuoteElement> = $props();
</script>

<blockquote
	class={cn('border-l-2 border-muted pl-3 text-sm text-muted-foreground italic', className)}
	{...restProps}
>
	{@render children?.()}
</blockquote>
