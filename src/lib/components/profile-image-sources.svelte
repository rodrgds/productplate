<script lang="ts">
	import { useDropzone, useFileInput, ProviderIcon } from '@uppy/svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let { onWebcam }: { onWebcam: () => void } = $props();

	const dropzone = useDropzone({ noClick: true });
	const fileInput = useFileInput();
</script>

<div class="flex h-full flex-col items-center justify-center gap-6">
	<input {...dropzone.getInputProps()} class="uppy:hidden" />
	<div
		{...dropzone.getRootProps()}
		role="button"
		class="flex w-full flex-col items-center justify-center gap-6 rounded-lg border-2 border-dashed border-border bg-muted/35 p-10 text-foreground transition-colors duration-200 hover:border-primary/45 hover:bg-muted/55"
	>
		<div class="flex items-center justify-center gap-6">
			<input {...fileInput.getInputProps()} class="hidden" />
			<Button
				{...fileInput.getButtonProps()}
				variant="outline"
				class="flex h-auto flex-col items-center gap-2 bg-background p-4 hover:bg-muted"
			>
				<div class="rounded-md bg-primary/10 p-2 text-primary">
					<ProviderIcon provider="device" fill="currentColor" />
				</div>
				<span class="text-sm font-medium">Device</span>
			</Button>

			<Button
				onclick={onWebcam}
				variant="outline"
				class="flex h-auto flex-col items-center gap-2 bg-background p-4 hover:bg-muted"
			>
				<div class="rounded-md bg-primary/10 p-2 text-primary">
					<ProviderIcon provider="camera" fill="currentColor" />
				</div>
				<span class="text-sm font-medium">Webcam</span>
			</Button>
		</div>
		<p class="text-sm text-muted-foreground">Drag & drop an image here, or click a button above</p>
	</div>
</div>
