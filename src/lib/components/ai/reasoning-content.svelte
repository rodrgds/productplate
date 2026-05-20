<script lang="ts">
	import { Streamdown } from 'svelte-streamdown';
	import Code from 'svelte-streamdown/code';
	import Mermaid from 'svelte-streamdown/mermaid';
	import Math from 'svelte-streamdown/math';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		class: className,
		text,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		text: string;
	} = $props();
</script>

<Collapsible.Content
	class={cn(
		'mt-4 text-sm',
		'text-muted-foreground outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2',
		className
	)}
	{...restProps}
>
	<Streamdown content={text} components={{ code: Code, mermaid: Mermaid, math: Math }} />
</Collapsible.Content>
