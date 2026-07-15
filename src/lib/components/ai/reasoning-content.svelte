<script lang="ts">
	import { Streamdown, createMathPlugin, createMermaidPlugin } from 'streamdown-svelte';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { cn } from '$lib/utils.js';

	let {
		class: className,
		text
	}: {
		class?: string;
		text: string;
	} = $props();

	const plugins = {
		math: createMathPlugin({ singleDollarTextMath: true }),
		mermaid: createMermaidPlugin()
	};
</script>

<Collapsible.Content
	class={cn(
		'mt-4 text-sm',
		'text-muted-foreground outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2',
		className
	)}
>
	<Streamdown content={text} {plugins} parseIncompleteMarkdown={true} />
</Collapsible.Content>
