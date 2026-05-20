<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { AttachmentData } from './attachment-utils.js';
	import { getMediaCategory, useAttachmentsContext, attachmentKey } from './attachment-utils.js';
	import { cn } from '$lib/utils.js';
	import { setContext } from 'svelte';

	let {
		data,
		onRemove,
		class: className,
		children,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		data: AttachmentData;
		onRemove?: () => void;
	} = $props();

	const { variant } = useAttachmentsContext();
	const mediaCategory = getMediaCategory(data);

	setContext(attachmentKey, { data, mediaCategory, onRemove, variant });
</script>

<div
	class={cn(
		'group relative',
		variant === 'grid' && 'size-24 overflow-hidden rounded-lg',
		variant === 'inline' && [
			'flex h-8 cursor-pointer items-center gap-1.5 select-none',
			'rounded-md border border-border px-1.5',
			'text-sm font-medium transition-all',
			'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50'
		],
		variant === 'list' && [
			'flex w-full items-center gap-3 rounded-lg border p-3',
			'hover:bg-accent/50'
		],
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
