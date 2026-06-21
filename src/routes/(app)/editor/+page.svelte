<script lang="ts">
	import 'prosekit/basic/style.css';
	import 'prosekit/basic/typography.css';

	import { APP_NAME } from '$lib/constants.js';
	import { browser } from '$app/environment';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { createEditor, type Editor } from 'prosekit/core';
	import { defineBasicExtension } from 'prosekit/basic';
	import { ProseKit } from 'prosekit/svelte';
	import EditorToolbar from '$lib/components/editor-toolbar.svelte';

	let editor = $state<Editor | null>(null);

	if (browser) {
		editor = createEditor({
			extension: defineBasicExtension(),
			defaultContent: '<h2>Product notes</h2><p>Use this page as a local rich text scratchpad.</p>'
		});
	}
</script>

<svelte:head>
	<title>Editor | {APP_NAME}</title>
</svelte:head>

<header class="flex h-16 shrink-0 items-center gap-2 border-b">
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium">Editor</h1>
	</div>
</header>

<div class="p-4 lg:p-6">
	<div class="mx-auto max-w-4xl overflow-hidden rounded-xl border bg-card shadow-sm">
		{#if editor}
			<ProseKit {editor}>
				<EditorToolbar />
				<div
					class="ProseMirror prosekit-editor min-h-[420px] px-6 py-5 outline-none"
					{@attach editor.mount}
				></div>
			</ProseKit>
		{:else}
			<div class="min-h-[420px] p-6 text-sm text-muted-foreground">Loading editor...</div>
		{/if}
	</div>
</div>
