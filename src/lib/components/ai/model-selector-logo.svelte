<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		provider,
		class: className,
		...restProps
	}: Omit<HTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
		provider: string;
	} = $props();
</script>

<img
	{...restProps}
	alt={`${provider} logo`}
	class={cn('size-3 dark:invert', className)}
	height={12}
	src={`https://models.dev/logos/${provider}.svg`}
	width={12}
/>
