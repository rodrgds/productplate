<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { cn } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';

	let {
		class: className,
		onKeyDown,
		placeholder = 'What would you like to know?',
		value,
		...restProps
	}: ComponentProps<typeof InputGroup.Textarea> & {
		value?: string;
		onKeyDown?: (e: KeyboardEvent) => void;
	} = $props();

	let isComposing = $state(false);

	function handleKeyDown(e: KeyboardEvent) {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;

		if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
			e.preventDefault();
			const target = e.currentTarget as HTMLTextAreaElement | null;
			const form = target?.form;
			const submitButton = form?.querySelector('button[type="submit"]') as HTMLButtonElement | null;
			if (submitButton?.disabled) return;
			form?.requestSubmit();
		}
	}

	function handleCompositionStart() {
		isComposing = true;
	}

	function handleCompositionEnd() {
		isComposing = false;
	}
</script>

<InputGroup.Textarea
	class={cn('field-sizing-content max-h-48 min-h-16', className)}
	name="message"
	oncompositionend={handleCompositionEnd}
	oncompositionstart={handleCompositionStart}
	onkeydown={handleKeyDown}
	{placeholder}
	{value}
	{...restProps}
/>
