<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { UIMessage } from 'ai';
	import { cn } from '$lib/utils.js';

	let {
		from,
		class: className,
		children,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		from: UIMessage['role'];
	} = $props();
</script>

<div
	class={cn(
		'group flex w-full max-w-[95%] flex-col gap-2',
		from === 'user' ? 'is-user ml-auto justify-end' : 'is-assistant',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
