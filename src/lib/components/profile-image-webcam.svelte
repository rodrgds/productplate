<script lang="ts">
	import { useWebcam } from '@uppy/svelte';
	import { untrack } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Trash2, Check, Camera } from '@lucide/svelte';

	const webcam = useWebcam();

	$effect(() => {
		untrack(() => webcam.start());
		return () => {
			untrack(() => webcam.stop());
		};
	});

	const videoProps = $derived(webcam.getVideoProps());
	const snapshotProps = $derived(webcam.getSnapshotButtonProps());
	const submitProps = $derived(webcam.getSubmitButtonProps());
	const discardProps = $derived(webcam.getDiscardButtonProps());
	const state = $derived(webcam.state);

	const isCaptured = $derived(!!state.capturedSnapshot);
	const hasError = $derived(!!state.cameraError);
	const isReady = $derived(state.cameraReady && !hasError);
	const mirrored = $derived(
		'data-uppy-mirrored' in videoProps &&
			(videoProps as Record<string, unknown>)['data-uppy-mirrored']
	);
</script>

<div class="flex h-full flex-col">
	<div
		class="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-black"
	>
		<video {...videoProps} class="max-h-full w-full object-contain" class:mirror={mirrored}></video>
		{#if hasError}
			<div class="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
				<p class="text-center text-sm">{state.cameraError}</p>
			</div>
		{/if}
	</div>

	<div class="mt-4 flex items-center justify-center gap-2">
		{#if isCaptured}
			<Button variant="outline" size="sm" {...discardProps}>
				<Trash2 class="mr-2 h-4 w-4" />
				Retake
			</Button>
			<Button variant="default" size="sm" {...submitProps}>
				<Check class="mr-2 h-4 w-4" />
				Use Photo
			</Button>
		{:else}
			<Button variant="default" size="sm" {...snapshotProps}>
				<Camera class="mr-2 h-4 w-4" />
				Snapshot
			</Button>
		{/if}
	</div>

	{#if !isReady && !hasError && !isCaptured}
		<p class="mt-2 text-center text-xs text-muted-foreground">Waiting for camera...</p>
	{/if}
</div>

<style>
	.mirror {
		transform: scaleX(-1);
	}
</style>
