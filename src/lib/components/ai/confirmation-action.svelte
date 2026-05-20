<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';

	let { class: className, children, ...restProps }: ComponentProps<typeof Button> = $props();
</script>

<Button class={cn('h-8 px-3 text-sm', className)} type="button" {...restProps}>
	{@render children?.()}
</Button>
