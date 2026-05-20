<script lang="ts">
	import CodeBlock from './code-block.svelte';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ToolPart } from './tool.svelte';

	let {
		class: className,
		input,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		input: ToolPart['input'];
	} = $props();
</script>

<div class={cn('space-y-2 overflow-hidden', className)} {...restProps}>
	<h4 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">Parameters</h4>
	<div class="rounded-md bg-muted/50">
		<CodeBlock code={JSON.stringify(input, null, 2)} language="json" />
	</div>
</div>
