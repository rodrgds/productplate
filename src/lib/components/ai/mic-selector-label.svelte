<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	const deviceIdRegex = /\(([\da-fA-F]{4}:[\da-fA-F]{4})\)$/;

	let {
		device,
		class: className,
		...restProps
	}: HTMLAttributes<HTMLSpanElement> & {
		device: MediaDeviceInfo;
	} = $props();

	const matches = device.label.match(deviceIdRegex);
	const deviceId = $derived(matches ? matches[1] : '');
	const name = $derived(matches ? device.label.replace(deviceIdRegex, '') : device.label);
</script>

{#if !matches}
	<span class={className} {...restProps}>{device.label}</span>
{:else}
	<span class={className} {...restProps}>
		<span>{name}</span>
		<span class="text-muted-foreground"> ({deviceId})</span>
	</span>
{/if}
