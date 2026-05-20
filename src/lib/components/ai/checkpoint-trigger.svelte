<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import type { ComponentProps } from 'svelte';

	let {
		children,
		variant = 'ghost' as ComponentProps<typeof Button>['variant'],
		size = 'sm' as ComponentProps<typeof Button>['size'],
		tooltip,
		...restProps
	}: ComponentProps<typeof Button> & {
		tooltip?: string;
	} = $props();
</script>

{#if tooltip}
	<Tooltip.Root>
		<Tooltip.Trigger>
			<Button {size} type="button" {variant} {...restProps}>
				{@render children?.()}
			</Button>
		</Tooltip.Trigger>
		<Tooltip.Content align="start" side="bottom">
			{tooltip}
		</Tooltip.Content>
	</Tooltip.Root>
{:else}
	<Button {size} type="button" {variant} {...restProps}>
		{@render children?.()}
	</Button>
{/if}
