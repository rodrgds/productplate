<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { cn } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';

	let { class: className, ...restProps }: ComponentProps<typeof InputGroup.Addon> = $props();
</script>

<InputGroup.Addon
	align="block-end"
	class={cn('order-first flex-wrap gap-1', className)}
	{...restProps}
/>
