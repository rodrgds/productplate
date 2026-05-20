<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		code,
		language = 'text',
		class: className,
		...restProps
	}: HTMLAttributes<HTMLPreElement> & {
		code: string;
		language?: string;
	} = $props();
</script>

<pre class={cn('overflow-x-auto rounded-md bg-muted p-4 text-sm', className)} {...restProps}><code
		class="language-{language}">{code}</code
	></pre>
