<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getAttachmentLabel, useAttachmentContext } from './attachment-utils.js';
	import { cn } from '$lib/utils.js';

	let {
		showMediaType = false,
		class: className,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		showMediaType?: boolean;
	} = $props();

	const { data, variant } = useAttachmentContext();
	const label = getAttachmentLabel(data);
</script>

{#if variant !== 'grid'}
	<div class={cn('min-w-0 flex-1', className)} {...restProps}>
		<span class="block truncate">{label}</span>
		{#if showMediaType && data.mediaType}
			<span class="block truncate text-xs text-muted-foreground">{data.mediaType}</span>
		{/if}
	</div>
{/if}
