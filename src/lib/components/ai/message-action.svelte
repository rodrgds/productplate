<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import type { ComponentProps } from 'svelte';

	let {
		tooltip,
		label,
		children,
		variant = 'ghost' as ComponentProps<typeof Button>['variant'],
		size = 'icon-sm' as ComponentProps<typeof Button>['size'],
		...restProps
	}: ComponentProps<typeof Button> & {
		tooltip?: string;
		label?: string;
	} = $props();
</script>

{#if tooltip}
	<Tooltip.Root>
		<Tooltip.Trigger>
			<Button {size} type="button" {variant} {...restProps}>
				{@render children?.()}
				<span class="sr-only">{label || tooltip}</span>
			</Button>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>{tooltip}</p>
		</Tooltip.Content>
	</Tooltip.Root>
{:else}
	<Button {size} type="button" {variant} {...restProps}>
		{@render children?.()}
		<span class="sr-only">{label || tooltip}</span>
	</Button>
{/if}
