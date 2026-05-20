<script lang="ts">
	import { Streamdown } from 'svelte-streamdown';
	import Code from 'svelte-streamdown/code';
	import Mermaid from 'svelte-streamdown/mermaid';
	import Math from 'svelte-streamdown/math';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		class: className,
		children,
		animation,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		animation?: boolean;
	} = $props();
</script>

<Streamdown
	class={cn('size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0', className)}
	components={{ code: Code, mermaid: Mermaid, math: Math }}
	{animation}
	{...restProps}
>
	{@render children?.()}
</Streamdown>
