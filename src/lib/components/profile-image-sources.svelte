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
		class="flex w-full flex-col items-center justify-center gap-6 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-10 transition-colors duration-200 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900"
	>
		<div class="flex items-center justify-center gap-6">
			<input {...fileInput.getInputProps()} class="hidden" />
			<Button
				{...fileInput.getButtonProps()}
				variant="outline"
				class="flex h-auto flex-col items-center gap-2 p-4"
			>
				<div class="rounded-md bg-white p-2 shadow-sm dark:bg-gray-800">
					<ProviderIcon provider="device" fill="#1269cf" />
				</div>
				<span class="text-sm font-medium">Device</span>
			</Button>

			<Button
				onclick={onWebcam}
				variant="outline"
				class="flex h-auto flex-col items-center gap-2 p-4"
			>
				<div class="rounded-md bg-white p-2 shadow-sm dark:bg-gray-800">
					<ProviderIcon provider="camera" fill="#02B383" />
				</div>
				<span class="text-sm font-medium">Webcam</span>
			</Button>
		</div>
		<p class="text-sm text-muted-foreground">Drag & drop an image here, or click a button above</p>
	</div>
</div>
