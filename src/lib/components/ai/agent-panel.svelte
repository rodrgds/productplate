<script lang="ts">
	import { Chat } from '@ai-sdk/svelte';
	import { DefaultChatTransport } from 'ai';
	import { Bot, Send, Square, Sparkles, User, ArrowDown, Lightbulb, Wrench } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { tick } from 'svelte';
	import MarkdownMessage from './markdown-message.svelte';
	import {
		Suggestions,
		Suggestion,
		Reasoning,
		ReasoningTrigger,
		ReasoningContent,
		Tool,
		ToolHeader,
		ToolContent,
		ToolInput,
		ToolOutput,
		Shimmer
	} from '$lib/components/ai/index.js';

	let input = $state('');
	let scrollContainer = $state<HTMLDivElement | null>(null);
	let showScrollButton = $state(false);
	let isComposing = $state(false);

	const chat = new Chat({
		transport: new DefaultChatTransport({
			api: '/api/chat'
		})
	});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const text = input.trim();
		if (!text || chat.status === 'submitted' || chat.status === 'streaming') return;
		chat.sendMessage({ text });
		input = '';
		tick().then(() => scrollToBottom());
	}

	let isBusy = $derived(chat.status === 'submitted' || chat.status === 'streaming');

	const suggestions = [
		'Plan an MVP launch',
		'Design a landing page component',
		'Calculate (128 * 7) / 3',
		'Debug a Convex query pattern'
	];

	function handleSuggestion(text: string) {
		if (isBusy) return;
		chat.sendMessage({ text });
		tick().then(() => scrollToBottom());
	}

	function scrollToBottom() {
		if (scrollContainer) {
			scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
		}
	}

	function handleScroll() {
		if (!scrollContainer) return;
		const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
		showScrollButton = scrollHeight - scrollTop - clientHeight > 100;
	}
</script>

<section
	class="flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm"
>
	<!-- Header -->
	<div class="flex items-center justify-between border-b px-4 py-3">
		<div class="flex items-center gap-3">
			<div
				class="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
			>
				<Bot class="size-4" />
			</div>
			<div>
				<h2 class="text-sm font-semibold">AI workbench</h2>
				<p class="text-xs text-muted-foreground">OpenRouter free router with a calculator tool.</p>
			</div>
		</div>
		<div
			class="flex items-center gap-1.5 rounded-md border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
		>
			<Wrench class="size-3.5" />
			<span>calculator</span>
		</div>
	</div>

	<!-- Messages -->
	<div
		bind:this={scrollContainer}
		onscroll={handleScroll}
		class="relative flex-1 overflow-y-auto p-4"
	>
		{#if chat.messages.length === 0}
			<div class="flex h-full flex-col items-center justify-center gap-6 py-12">
				<div
					class="flex size-12 items-center justify-center rounded-2xl border bg-background shadow-sm"
				>
					<Sparkles class="size-5 text-muted-foreground" />
				</div>
				<div class="text-center">
					<p class="text-sm font-medium text-foreground">Ask me anything</p>
					<p class="mt-1 text-sm text-muted-foreground">
						I can help with planning, components, or arithmetic.
					</p>
				</div>
			</div>
		{/if}

		{#each chat.messages as message (message.id)}
			{#if message.role === 'user'}
				<div class="flex justify-end gap-3">
					<div class="max-w-[80%] space-y-1">
						<div class="flex items-center justify-end gap-2">
							<span class="text-xs font-medium text-muted-foreground">You</span>
							<div
								class="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground"
							>
								<User class="size-3" />
							</div>
						</div>
						<div
							class="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm whitespace-pre-wrap text-primary-foreground"
						>
							{#each message.parts as part (`${message.id}-${part.type}`)}
								{#if part.type === 'text'}
									{part.text}
								{/if}
							{/each}
						</div>
					</div>
				</div>
			{:else}
				<div class="flex justify-start gap-3">
					<div
						class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
					>
						<Bot class="size-3.5" />
					</div>
					<div class="max-w-[85%] space-y-2">
						<span class="text-xs font-medium text-muted-foreground">Assistant</span>
						<div class="space-y-3 text-sm">
							{#each message.parts as part, partIndex (`${message.id}-${partIndex}`)}
								{#if part.type === 'text'}
									<div class="rounded-2xl rounded-tl-sm border bg-background px-4 py-3 shadow-sm">
										<MarkdownMessage text={part.text} />
									</div>
								{:else if part.type === 'tool-calculator'}
									<Tool>
										<ToolHeader type="tool-calculator" state={part.state} title="Calculator" />
										<ToolContent>
											{#if part.input}
												<ToolInput input={part.input} />
											{/if}
											{#if part.output}
												<ToolOutput output={part.output} errorText={part.errorText} />
											{/if}
										</ToolContent>
									</Tool>
								{:else if part.type === 'reasoning'}
									<Reasoning
										isStreaming={chat.status === 'streaming' &&
											partIndex === message.parts.length - 1}
									>
										<ReasoningTrigger />
										<ReasoningContent text={part.text} />
									</Reasoning>
								{/if}
							{/each}
						</div>
					</div>
				</div>
			{/if}
		{/each}

		{#if chat.status === 'submitted'}
			<div class="flex justify-start gap-3">
				<div
					class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
				>
					<Bot class="size-3.5" />
				</div>
				<div class="space-y-2">
					<span class="text-xs font-medium text-muted-foreground">Assistant</span>
					<div
						class="flex items-center gap-2 rounded-2xl rounded-tl-sm border bg-background px-4 py-3 text-sm text-muted-foreground shadow-sm"
					>
						<span class="relative flex size-2">
							<span
								class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"
							></span>
							<span class="relative inline-flex size-2 rounded-full bg-primary"></span>
						</span>
						<Shimmer duration={1}>Thinking...</Shimmer>
					</div>
				</div>
			</div>
		{/if}

		{#if chat.error}
			<div
				class="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
			>
				{chat.error.message}
			</div>
		{/if}
	</div>

	<!-- Scroll to bottom -->
	{#if showScrollButton}
		<div class="absolute bottom-20 left-1/2 z-10 -translate-x-1/2">
			<Button
				variant="secondary"
				size="sm"
				class="h-8 gap-1 rounded-full shadow-md"
				onclick={scrollToBottom}
			>
				<ArrowDown class="size-3" />
				<span class="text-xs">New messages</span>
			</Button>
		</div>
	{/if}

	<!-- Suggestions -->
	{#if chat.messages.length === 0}
		<div class="shrink-0 border-t bg-muted/20 px-4 py-3">
			<div class="flex items-center gap-2 text-xs font-medium text-muted-foreground">
				<Lightbulb class="size-3.5" />
				<span>Suggestions</span>
			</div>
			<div class="mt-2">
				<Suggestions>
					{#each suggestions as suggestion (suggestion)}
						<Suggestion {suggestion} onClick={handleSuggestion} />
					{/each}
				</Suggestions>
			</div>
		</div>
	{/if}

	<!-- Input -->
	<div class="shrink-0 border-t bg-background p-4">
		<form class="flex items-end gap-2" onsubmit={handleSubmit}>
			<div class="relative flex-1">
				<textarea
					bind:value={input}
					rows={1}
					class="field-sizing-content max-h-48 min-h-11 w-full resize-none rounded-xl border border-input bg-muted/30 px-4 py-2.5 text-sm shadow-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/50"
					placeholder="Ask the agent..."
					aria-label="Message"
					onkeydown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
							e.preventDefault();
							handleSubmit(e as unknown as SubmitEvent);
						}
					}}
					oncompositionstart={() => (isComposing = true)}
					oncompositionend={() => (isComposing = false)}
				></textarea>
			</div>
			{#if isBusy}
				<Button
					type="button"
					variant="secondary"
					size="icon"
					class="size-11 shrink-0 rounded-xl"
					onclick={() => chat.stop()}
					aria-label="Stop"
				>
					<Square class="size-4" />
				</Button>
			{:else}
				<Button
					type="submit"
					size="icon"
					class="size-11 shrink-0 rounded-xl"
					aria-label="Send"
					disabled={!input.trim()}
				>
					<Send class="size-4" />
				</Button>
			{/if}
		</form>
	</div>
</section>
