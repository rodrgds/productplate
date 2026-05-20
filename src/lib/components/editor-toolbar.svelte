<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { useEditor, useEditorDerivedValue } from 'prosekit/svelte';
	import { get } from 'svelte/store';
	import type { BasicExtension } from 'prosekit/basic';
	import type { Editor } from 'prosekit/core';
	import { Bold, Italic, List, ListOrdered, Pilcrow, Heading2, Undo2, Redo2 } from '@lucide/svelte';

	const editor = useEditor<BasicExtension>({ update: true });

	function getToolbarState(editor: Editor<BasicExtension>) {
		return {
			bold: editor.commands.toggleBold
				? {
						isActive: editor.marks.bold.isActive(),
						canExec: editor.commands.toggleBold.canExec()
					}
				: undefined,
			italic: editor.commands.toggleItalic
				? {
						isActive: editor.marks.italic.isActive(),
						canExec: editor.commands.toggleItalic.canExec()
					}
				: undefined,
			heading2: editor.commands.toggleHeading
				? {
						isActive: editor.nodes.heading.isActive({ level: 2 }),
						canExec: editor.commands.toggleHeading.canExec({ level: 2 })
					}
				: undefined,
			paragraph: editor.commands.setParagraph
				? {
						isActive: editor.nodes.paragraph.isActive(),
						canExec: editor.commands.setParagraph.canExec()
					}
				: undefined,
			bulletList: editor.commands.toggleList
				? {
						isActive: editor.nodes.list.isActive({ kind: 'bullet' }),
						canExec: editor.commands.toggleList.canExec({ kind: 'bullet' })
					}
				: undefined,
			orderedList: editor.commands.toggleList
				? {
						isActive: editor.nodes.list.isActive({ kind: 'ordered' }),
						canExec: editor.commands.toggleList.canExec({ kind: 'ordered' })
					}
				: undefined,
			undo: editor.commands.undo ? { canExec: editor.commands.undo.canExec() } : undefined,
			redo: editor.commands.redo ? { canExec: editor.commands.redo.canExec() } : undefined
		};
	}

	const toolbarState = useEditorDerivedValue(getToolbarState);
</script>

<div class="flex flex-wrap items-center gap-1 border-b p-2">
	<Button
		variant="ghost"
		size="icon"
		class={$toolbarState.bold?.isActive ? 'bg-accent text-accent-foreground' : ''}
		disabled={!$toolbarState.bold?.canExec}
		onclick={() => get(editor)?.commands.toggleBold()}
		aria-label="Bold"
		title="Bold"
		type="button"
	>
		<Bold class="size-4" />
	</Button>
	<Button
		variant="ghost"
		size="icon"
		class={$toolbarState.italic?.isActive ? 'bg-accent text-accent-foreground' : ''}
		disabled={!$toolbarState.italic?.canExec}
		onclick={() => get(editor)?.commands.toggleItalic()}
		aria-label="Italic"
		title="Italic"
		type="button"
	>
		<Italic class="size-4" />
	</Button>

	<Separator orientation="vertical" class="mx-1 h-6" />

	<Button
		variant="ghost"
		size="icon"
		class={$toolbarState.heading2?.isActive ? 'bg-accent text-accent-foreground' : ''}
		disabled={!$toolbarState.heading2?.canExec}
		onclick={() => get(editor)?.commands.toggleHeading({ level: 2 })}
		aria-label="Heading"
		title="Heading"
		type="button"
	>
		<Heading2 class="size-4" />
	</Button>
	<Button
		variant="ghost"
		size="icon"
		class={$toolbarState.paragraph?.isActive ? 'bg-accent text-accent-foreground' : ''}
		disabled={!$toolbarState.paragraph?.canExec}
		onclick={() => get(editor)?.commands.setParagraph()}
		aria-label="Paragraph"
		title="Paragraph"
		type="button"
	>
		<Pilcrow class="size-4" />
	</Button>

	<Separator orientation="vertical" class="mx-1 h-6" />

	<Button
		variant="ghost"
		size="icon"
		class={$toolbarState.bulletList?.isActive ? 'bg-accent text-accent-foreground' : ''}
		disabled={!$toolbarState.bulletList?.canExec}
		onclick={() => get(editor)?.commands.toggleList({ kind: 'bullet' })}
		aria-label="Bullet list"
		title="Bullet list"
		type="button"
	>
		<List class="size-4" />
	</Button>
	<Button
		variant="ghost"
		size="icon"
		class={$toolbarState.orderedList?.isActive ? 'bg-accent text-accent-foreground' : ''}
		disabled={!$toolbarState.orderedList?.canExec}
		onclick={() => get(editor)?.commands.toggleList({ kind: 'ordered' })}
		aria-label="Ordered list"
		title="Ordered list"
		type="button"
	>
		<ListOrdered class="size-4" />
	</Button>

	<div class="flex-1"></div>

	<Button
		variant="ghost"
		size="icon"
		disabled={!$toolbarState.undo?.canExec}
		onclick={() => get(editor)?.commands.undo()}
		aria-label="Undo"
		title="Undo"
		type="button"
	>
		<Undo2 class="size-4" />
	</Button>
	<Button
		variant="ghost"
		size="icon"
		disabled={!$toolbarState.redo?.canExec}
		onclick={() => get(editor)?.commands.redo()}
		aria-label="Redo"
		title="Redo"
		type="button"
	>
		<Redo2 class="size-4" />
	</Button>
</div>
