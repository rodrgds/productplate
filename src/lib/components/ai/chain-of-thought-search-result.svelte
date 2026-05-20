<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<Badge
	class={cn('gap-1 px-2 py-0.5 text-xs font-normal', className)}
	variant="secondary"
	{...restProps}
>
	{@render children?.()}
</Badge>
