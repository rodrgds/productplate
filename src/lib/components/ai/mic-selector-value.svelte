<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import { useMicSelector } from './ai-contexts.js';
	import MicSelectorLabel from './mic-selector-label.svelte';

	let { class: className, ...restProps }: HTMLAttributes<HTMLSpanElement> = $props();

	const { devices, value } = useMicSelector();
	const currentDevice = $derived(devices.find((d) => d.deviceId === value));
</script>

{#if !currentDevice}
	<span class={cn('flex-1 text-left', className)} {...restProps}> Select microphone... </span>
{:else}
	<MicSelectorLabel
		class={cn('flex-1 text-left', className)}
		device={currentDevice}
		{...restProps}
	/>
{/if}
