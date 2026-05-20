<script lang="ts">
	import { AlertDescription } from '$lib/components/ui/alert/index.js';
	import { cn } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';

	let { class: className, ...restProps }: ComponentProps<typeof AlertDescription> = $props();
</script>

<AlertDescription class={cn('inline', className)} {...restProps} />
