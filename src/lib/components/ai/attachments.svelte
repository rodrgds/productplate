<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import { setContext } from 'svelte';
	import type { AttachmentVariant } from './attachment-utils.js';
	import { attachmentsKey } from './attachment-utils.js';

	let {
		variant = 'grid' as AttachmentVariant,
		class: className,
		children,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		variant?: AttachmentVariant;
	} = $props();

	setContext(attachmentsKey, { variant });
</script>

<div
	class={cn(
		'flex items-start',
		variant === 'list' ? 'flex-col gap-2' : 'flex-wrap gap-2',
		variant === 'grid' && 'ml-auto w-fit',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
