<script lang="ts">
	import type { UIMessage } from 'ai';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DownloadIcon } from '@lucide/svelte';
	import { cn } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';

	let {
		messages,
		filename = 'conversation.md',
		formatMessage = defaultFormatMessage,
		class: className,
		children,
		...restProps
	}: Omit<ComponentProps<typeof Button>, 'onclick'> & {
		messages: UIMessage[];
		filename?: string;
		formatMessage?: (message: UIMessage, index: number) => string;
	} = $props();

	function getMessageText(message: UIMessage): string {
		return message.parts
			.filter((part) => part.type === 'text')
			.map((part) => part.text)
			.join('');
	}

	function defaultFormatMessage(message: UIMessage): string {
		const roleLabel = message.role.charAt(0).toUpperCase() + message.role.slice(1);
		return `**${roleLabel}:** ${getMessageText(message)}`;
	}

	function messagesToMarkdown(
		messages: UIMessage[],
		formatMessage: (message: UIMessage, index: number) => string
	): string {
		return messages.map((msg, i) => formatMessage(msg, i)).join('\n\n');
	}

	function handleDownload() {
		const markdown = messagesToMarkdown(messages, formatMessage);
		const blob = new Blob([markdown], { type: 'text/markdown' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.append(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	}
</script>

<Button
	class={cn(
		'absolute top-4 right-4 rounded-full dark:bg-background dark:hover:bg-muted',
		className
	)}
	onclick={handleDownload}
	size="icon"
	type="button"
	variant="outline"
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<DownloadIcon class="size-4" />
	{/if}
</Button>
