<script lang="ts" module>
	import type { FileUIPart } from 'ai';
	import { getContext } from 'svelte';

	export interface AttachmentsContext {
		files: (FileUIPart & { id: string })[];
		add: (files: File[] | FileList) => void;
		remove: (id: string) => void;
		clear: () => void;
		openFileDialog: () => void;
		fileInputRef: HTMLInputElement | null;
	}

	export interface TextInputContext {
		value: string;
		setInput: (v: string) => void;
		clear: () => void;
	}

	export interface PromptInputMessage {
		text: string;
		files: FileUIPart[];
	}

	export const promptInputKey = Symbol('prompt-input');
	export const attachmentsKey = Symbol('attachments');

	export function usePromptInputController() {
		const ctx = getContext(promptInputKey) as unknown;
		if (!ctx) {
			throw new Error(
				'Wrap your component inside <PromptInputProvider> to use usePromptInputController().'
			);
		}
		return ctx;
	}

	export function useProviderAttachments(): AttachmentsContext {
		const ctx = getContext(attachmentsKey) as AttachmentsContext | null;
		if (!ctx) {
			throw new Error(
				'Wrap your component inside <PromptInputProvider> to use useProviderAttachments().'
			);
		}
		return ctx;
	}
</script>

<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { cn } from '$lib/utils.js';
	import { nanoid } from 'nanoid';
	import { setContext } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let {
		class: className,
		accept,
		multiple,
		onSubmit,
		children
	}: Omit<HTMLAttributes<HTMLFormElement>, 'onsubmit'> & {
		accept?: string;
		multiple?: boolean;
		onSubmit: (message: PromptInputMessage, event: SubmitEvent) => void | Promise<void>;
		children?: Snippet<[{ attachments: AttachmentsContext }]>;
	} = $props();

	let inputRef = $state<HTMLInputElement | null>(null);
	let formRef = $state<HTMLFormElement | null>(null);
	let attachmentFiles = $state<(FileUIPart & { id: string })[]>([]);

	function addFiles(fileList: File[] | FileList) {
		const incoming = [...fileList];
		const next: (FileUIPart & { id: string })[] = [];
		for (const file of incoming) {
			next.push({
				filename: file.name,
				id: nanoid(),
				mediaType: file.type,
				type: 'file',
				url: URL.createObjectURL(file)
			});
		}
		attachmentFiles = [...attachmentFiles, ...next];
	}

	function removeFile(id: string) {
		const found = attachmentFiles.find((f) => f.id === id);
		if (found?.url) {
			URL.revokeObjectURL(found.url);
		}
		attachmentFiles = attachmentFiles.filter((f) => f.id !== id);
	}

	function clearAttachments() {
		for (const f of attachmentFiles) {
			if (f.url) {
				URL.revokeObjectURL(f.url);
			}
		}
		attachmentFiles = [];
	}

	function openFileDialog() {
		inputRef?.click();
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement | null;
		if (!form) return;
		const formData = new FormData(form);
		const text = (formData.get('message') as string) || '';
		form.reset();

		try {
			const convertedFiles: FileUIPart[] = await Promise.all(
				attachmentFiles.map(async (item) => {
					if (item.url?.startsWith('blob:')) {
						try {
							const response = await fetch(item.url);
							const blob = await response.blob();
							const dataUrl = await new Promise<string | null>((resolve) => {
								const reader = new FileReader();
								reader.onloadend = () => resolve(reader.result as string);
								reader.onerror = () => resolve(null);
								reader.readAsDataURL(blob);
							});
							return { ...item, url: dataUrl ?? item.url };
						} catch {
							return item;
						}
					}
					return item;
				})
			);

			await onSubmit({ files: convertedFiles, text }, event);
			clearAttachments();
		} catch {
			// Don't clear on error
		}
	}

	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			addFiles(target.files);
		}
		target.value = '';
	}

	const attachmentsCtx: AttachmentsContext = {
		get files() {
			return attachmentFiles;
		},
		add: addFiles,
		remove: removeFile,
		clear: clearAttachments,
		openFileDialog,
		get fileInputRef() {
			return inputRef;
		}
	};

	setContext(attachmentsKey, attachmentsCtx);
</script>

<input
	{accept}
	aria-label="Upload files"
	class="hidden"
	{multiple}
	onchange={handleChange}
	bind:this={inputRef}
	title="Upload files"
	type="file"
/>
<form class={cn('w-full', className)} onsubmit={handleSubmit} bind:this={formRef}>
	<InputGroup.Root class="overflow-hidden">
		{@render children?.({ attachments: attachmentsCtx })}
	</InputGroup.Root>
</form>
