<script lang="ts">
	import type { Snippet } from 'svelte';
	import CodeBlock from './code-block.svelte';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ToolPart } from './tool.svelte';

	let {
		class: className,
		output,
		errorText,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		output: ToolPart['output'];
		errorText: ToolPart['errorText'];
	} = $props();
</script>

{#if output || errorText}
	<div class={cn('space-y-2', className)} {...restProps}>
		<h4 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
			{errorText ? 'Error' : 'Result'}
		</h4>
		<div
			class={cn(
				'overflow-x-auto rounded-md text-xs [&_table]:w-full',
				errorText ? 'bg-destructive/10 text-destructive' : 'bg-muted/50 text-foreground'
			)}
		>
			{#if errorText}
				<div>{errorText}</div>
			{/if}
			{#if output}
				{#if typeof output === 'object' && !('$$render' in output)}
					<CodeBlock code={JSON.stringify(output, null, 2)} language="json" />
				{:else if typeof output === 'string'}
					<CodeBlock code={output} language="json" />
				{:else}
					<div>{@render (output as Snippet)()}</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}
