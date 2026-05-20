<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { cn } from '$lib/utils.js';

	let { class: className, children, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div
	class={cn('flex items-center gap-0.5 overflow-hidden text-muted-foreground', className)}
	{...restProps}
>
	{@render children?.()}
	<Separator />
</div>
