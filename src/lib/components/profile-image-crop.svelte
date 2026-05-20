<script lang="ts">
	import { useImageEditor } from '@uppy/svelte';
	import type { UppyFile } from '@uppy/core';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		RotateCcw,
		RotateCw,
		FlipHorizontal,
		ZoomIn,
		ZoomOut,
		Undo2,
		Check,
		Loader2
	} from '@lucide/svelte';

	let {
		file,
		onSave,
		isUploading
	}: {
		file: UppyFile<Record<string, unknown>, Record<string, unknown>>;
		onSave: () => void;
		isUploading: boolean;
	} = $props();

	const editor = useImageEditor({ file });

	const imageProps = $derived(editor.getImageProps());
	const rotateSliderProps = $derived(editor.getRotationSliderProps());
	const state = $derived(editor.state);
</script>

<div class="flex h-full flex-col gap-4">
	<div
		class="relative flex min-h-[200px] items-center justify-center overflow-hidden rounded-lg border bg-muted"
	>
		{#if imageProps.src}
			<img {...imageProps} class="max-h-[280px] w-auto rounded-md object-contain" />
		{:else}
			<div class="flex items-center justify-center text-sm text-muted-foreground">
				Loading image...
			</div>
		{/if}
	</div>

	<div class="space-y-3">
		<div class="flex items-center gap-2">
			<span class="w-24 text-sm font-medium">Rotation: {state.angle}°</span>
			<input {...rotateSliderProps} class="flex-1 accent-primary" />
		</div>

		<div class="flex flex-wrap gap-2">
			<Button variant="outline" size="sm" {...editor.getRotateButtonProps(-90)}>
				<RotateCcw class="mr-1 h-3.5 w-3.5" />
				-90°
			</Button>
			<Button variant="outline" size="sm" {...editor.getRotateButtonProps(90)}>
				<RotateCw class="mr-1 h-3.5 w-3.5" />
				+90°
			</Button>
			<Button variant="outline" size="sm" {...editor.getFlipHorizontalButtonProps()}>
				<FlipHorizontal class="mr-1 h-3.5 w-3.5" />
				Flip
			</Button>
			<Button variant="outline" size="sm" {...editor.getZoomButtonProps(0.1)}>
				<ZoomIn class="mr-1 h-3.5 w-3.5" />
				Zoom In
			</Button>
			<Button variant="outline" size="sm" {...editor.getZoomButtonProps(-0.1)}>
				<ZoomOut class="mr-1 h-3.5 w-3.5" />
				Zoom Out
			</Button>
		</div>

		<div class="flex flex-wrap gap-2">
			<Button variant="outline" size="sm" {...editor.getResetButtonProps()}>
				<Undo2 class="mr-1 h-3.5 w-3.5" />
				Reset
			</Button>
		</div>

		<div class="flex justify-end gap-2 pt-2">
			<Button size="sm" {...editor.getSaveButtonProps({ onClick: onSave })} disabled={isUploading}>
				{#if isUploading}
					<Loader2 class="mr-2 h-3.5 w-3.5 animate-spin" />
					Saving...
				{:else}
					<Check class="mr-2 h-3.5 w-3.5" />
					Save Picture
				{/if}
			</Button>
		</div>
	</div>
</div>
