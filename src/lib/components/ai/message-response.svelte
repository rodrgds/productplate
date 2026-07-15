<script lang="ts">
	import { Streamdown, createMathPlugin, createMermaidPlugin } from 'streamdown-svelte';
	import { cn } from '$lib/utils.js';
	let {
		class: className,
		content,
		animation
	}: {
		class?: string;
		content: string;
		animation?: boolean;
	} = $props();

	const plugins = {
		math: createMathPlugin({ singleDollarTextMath: true }),
		mermaid: createMermaidPlugin()
	};
</script>

<Streamdown
	class={cn('size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0', className)}
	{plugins}
	animation={{ enabled: animation ?? false }}
	parseIncompleteMarkdown={true}
	{content}
/>
