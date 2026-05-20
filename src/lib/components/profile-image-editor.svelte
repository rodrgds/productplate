<script lang="ts">
	import Uppy, { type UppyFile } from '@uppy/core';
	import UppyWebcam from '@uppy/webcam';
	import UppyImageEditor from '@uppy/image-editor';
	import { UppyContextProvider } from '@uppy/svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { X } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import '@uppy/svelte/css/style.css';
	import '@uppy/svelte/css/image-editor.css';
	import ProfileImageSources from './profile-image-sources.svelte';
	import ProfileImageWebcam from './profile-image-webcam.svelte';
	import ProfileImageCrop from './profile-image-crop.svelte';

	let {
		open = $bindable(false),
		onUploadComplete
	}: { open: boolean; onUploadComplete?: (url: string) => void } = $props();

	const convexClient = useConvexClient();

	let uppy = new Uppy({
		restrictions: {
			maxNumberOfFiles: 1,
			allowedFileTypes: ['image/*']
		},
		autoProceed: false
	})
		.use(UppyWebcam)
		.use(UppyImageEditor, {
			cropperOptions: {
				initialAspectRatio: 1,
				aspectRatio: 1,
				autoCropArea: 0.8
			},
			actions: {
				cropSquare: true,
				cropWidescreen: false,
				cropWidescreenVertical: false
			}
		});

	let step = $state<'sources' | 'webcam' | 'edit'>('sources');
	let selectedFile = $state<UppyFile<Record<string, unknown>, Record<string, unknown>> | null>(
		null
	);
	let isUploading = $state(false);
	let pendingUpload = $state(false);

	uppy.on('file-added', (file) => {
		if (!file.type?.startsWith('image/')) {
			toast.error('Please select an image file.');
			uppy.removeFile(file.id);
			return;
		}
		selectedFile = file;
		step = 'edit';
	});

	uppy.on('file-editor:complete', (file) => {
		if (!pendingUpload || !file?.data) return;
		handleUpload(file.data as Blob);
	});

	uppy.on('file-editor:cancel', () => {
		pendingUpload = false;
		isUploading = false;
	});

	function reset() {
		step = 'sources';
		selectedFile = null;
		uppy.cancelAll();
		isUploading = false;
		pendingUpload = false;
	}

	function handleCancel() {
		if (step === 'webcam' || step === 'edit') {
			reset();
		} else {
			open = false;
			reset();
		}
	}

	function handleSaveCrop() {
		if (!selectedFile) return;
		isUploading = true;
		pendingUpload = true;
	}

	async function handleUpload(data: Blob) {
		pendingUpload = false;
		try {
			const uploadUrl = await convexClient.mutation(api.storage.generateUploadUrl, {});
			const result = await fetch(uploadUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'image/jpeg' },
				body: data
			});

			if (!result.ok) throw new Error('Upload failed');
			const { storageId } = await result.json();
			const imageUrl = await convexClient.query(api.storage.getImageUrl, { storageId });

			if (imageUrl) {
				onUploadComplete?.(imageUrl);
				open = false;
				reset();
			}
		} catch (error) {
			console.error('Upload error:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to save profile picture');
		} finally {
			isUploading = false;
		}
	}

	$effect(() => {
		return () => {
			uppy.destroy();
		};
	});
</script>

<UppyContextProvider {uppy}>
	<Dialog.Root bind:open>
		<Dialog.Content class="flex h-[600px] flex-col overflow-hidden p-0 sm:max-w-[640px]">
			<Dialog.Header class="shrink-0 p-6 pb-0">
				<Dialog.Title>
					{#if step === 'sources'}
						Select Profile Picture
					{:else if step === 'webcam'}
						Take a Photo
					{:else}
						Edit your picture
					{/if}
				</Dialog.Title>
				<Dialog.Description>
					{#if step === 'sources'}
						Choose an image from your device or use your webcam.
					{:else if step === 'webcam'}
						Position yourself and click snapshot to capture.
					{:else}
						Adjust the image to fit.
					{/if}
				</Dialog.Description>
			</Dialog.Header>

			<div class="relative mt-4 flex-1 overflow-y-auto px-6">
				{#if step === 'sources'}
					<ProfileImageSources onWebcam={() => (step = 'webcam')} />
				{:else if step === 'webcam'}
					<ProfileImageWebcam />
				{:else if step === 'edit' && selectedFile}
					<ProfileImageCrop file={selectedFile} onSave={handleSaveCrop} {isUploading} />
				{/if}
			</div>

			<Dialog.Footer class="shrink-0 border-t bg-background p-6 pt-4">
				<div class="flex w-full items-center justify-between">
					<Button variant="ghost" onclick={handleCancel} disabled={isUploading}>
						<X class="mr-2 h-4 w-4" />
						Cancel
					</Button>
				</div>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</UppyContextProvider>
