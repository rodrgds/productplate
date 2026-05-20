<script lang="ts">
	import type { ToolUIPart, DynamicToolUIPart } from 'ai';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import {
		CheckCircleIcon,
		ChevronDownIcon,
		CircleIcon,
		ClockIcon,
		WrenchIcon,
		XCircleIcon
	} from '@lucide/svelte';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import { statusLabels } from './tool.svelte';

	let {
		class: className,
		title,
		type,
		state,
		toolName,
		...restProps
	}: HTMLAttributes<HTMLButtonElement> &
		(
			| { type: ToolUIPart['type']; state: ToolUIPart['state']; toolName?: never }
			| { type: DynamicToolUIPart['type']; state: DynamicToolUIPart['state']; toolName: string }
		) = $props();

	const derivedName = type === 'dynamic-tool' ? toolName : type.split('-').slice(1).join('-');
</script>

<Collapsible.Trigger
	class={cn('flex w-full items-center justify-between gap-4 p-3', className)}
	{...restProps}
>
	<div class="flex items-center gap-2">
		<WrenchIcon class="size-4 text-muted-foreground" />
		<span class="text-sm font-medium">{title ?? derivedName}</span>
		<Badge class="gap-1.5 rounded-full text-xs" variant="secondary">
			{#if state === 'approval-requested'}
				<ClockIcon class="size-4 text-yellow-600" />
			{:else if state === 'approval-responded'}
				<CheckCircleIcon class="size-4 text-blue-600" />
			{:else if state === 'input-available'}
				<ClockIcon class="size-4 animate-pulse" />
			{:else if state === 'input-streaming'}
				<CircleIcon class="size-4" />
			{:else if state === 'output-available'}
				<CheckCircleIcon class="size-4 text-green-600" />
			{:else if state === 'output-denied'}
				<XCircleIcon class="size-4 text-orange-600" />
			{:else if state === 'output-error'}
				<XCircleIcon class="size-4 text-red-600" />
			{/if}
			{statusLabels[state]}
		</Badge>
	</div>
	<ChevronDownIcon
		class="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
	/>
</Collapsible.Trigger>
