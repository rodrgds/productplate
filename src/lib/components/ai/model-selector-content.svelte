<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet, ComponentProps } from 'svelte';

	export type ModelSelectorProps = ComponentProps<typeof Dialog.Root>;
	export type ModelSelectorTriggerProps = ComponentProps<typeof Dialog.Trigger>;
	export type ModelSelectorContentProps = ComponentProps<typeof Dialog.Content> & {
		title?: Snippet | string;
	};
	export type ModelSelectorInputProps = ComponentProps<typeof Command.Input>;
	export type ModelSelectorListProps = ComponentProps<typeof Command.List>;
	export type ModelSelectorEmptyProps = ComponentProps<typeof Command.Empty>;
	export type ModelSelectorGroupProps = ComponentProps<typeof Command.Group>;
	export type ModelSelectorItemProps = ComponentProps<typeof Command.Item>;
	export type ModelSelectorShortcutProps = ComponentProps<typeof Command.Shortcut>;
	export type ModelSelectorSeparatorProps = ComponentProps<typeof Command.Separator>;
	export type ModelSelectorLogoProps = Omit<HTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
		provider: string;
	};
	export type ModelSelectorLogoGroupProps = HTMLAttributes<HTMLDivElement>;
	export type ModelSelectorNameProps = HTMLAttributes<HTMLSpanElement>;

	let {
		class: className,
		children,
		title = 'Model Selector',
		...restProps
	}: ModelSelectorContentProps = $props();
</script>

<Dialog.Content
	aria-describedby={undefined}
	class={cn('border-none! p-0 outline! outline-border! outline-solid!', className)}
	{...restProps}
>
	<Dialog.Title class="sr-only">
		{#if typeof title === 'string'}
			{title}
		{:else}
			{@render (title as Snippet)()}
		{/if}
	</Dialog.Title>
	<Command.Root class="**:data-[slot=command-input-wrapper]:h-auto">
		{@render children?.()}
	</Command.Root>
</Dialog.Content>
