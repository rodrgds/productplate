<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { mediaCategoryIcons, useAttachmentContext } from './attachment-utils.js';
	import { cn } from '$lib/utils.js';

	let {
		fallbackIcon,
		class: className,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		fallbackIcon?: Snippet;
	} = $props();

	const { data, mediaCategory, variant } = useAttachmentContext();
	const iconSize = variant === 'inline' ? 'size-3' : 'size-4';
	const Icon = mediaCategoryIcons[mediaCategory];
</script>

<div
	class={cn(
		'flex shrink-0 items-center justify-center overflow-hidden',
		variant === 'grid' && 'size-full bg-muted',
		variant === 'inline' && 'size-5 rounded bg-background',
		variant === 'list' && 'size-12 rounded bg-muted',
		className
	)}
	{...restProps}
>
	{#if mediaCategory === 'image' && data.type === 'file' && data.url}
		<img
			src={data.url}
			alt={data.filename || 'Image'}
			class={cn('size-full', variant === 'grid' ? 'object-cover' : 'rounded object-cover')}
			width={variant === 'grid' ? 96 : 20}
			height={variant === 'grid' ? 96 : 20}
		/>
	{:else if mediaCategory === 'video' && data.type === 'file' && data.url}
		<video src={data.url} muted class="size-full object-cover"></video>
	{:else if fallbackIcon}
		{@render fallbackIcon()}
	{:else}
		<Icon class={cn(iconSize, 'text-muted-foreground')} />
	{/if}
</div>
