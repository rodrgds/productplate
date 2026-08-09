<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { useEditor, useEditorDerivedValue } from 'prosekit/svelte';
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
	let currentEditor = $derived($editor);
	let bold = $derived($toolbarState.bold);
	let italic = $derived($toolbarState.italic);
	let heading2 = $derived($toolbarState.heading2);
	let paragraph = $derived($toolbarState.paragraph);
	let bulletList = $derived($toolbarState.bulletList);
	let orderedList = $derived($toolbarState.orderedList);
	let undo = $derived($toolbarState.undo);
	let redo = $derived($toolbarState.redo);
</script>

<div class="flex flex-wrap items-center gap-1 border-b p-2">
	<Button
		variant="ghost"
		size="icon"
		class={bold?.isActive ? 'bg-accent text-accent-foreground' : ''}
		disabled={!bold?.canExec}
		onclick={() => currentEditor?.commands.toggleBold()}
		aria-label="Bold"
		title="Bold"
		type="button"
	>
		<Bold class="size-4" />
	</Button>
	<Button
		variant="ghost"
		size="icon"
		class={italic?.isActive ? 'bg-accent text-accent-foreground' : ''}
		disabled={!italic?.canExec}
		onclick={() => currentEditor?.commands.toggleItalic()}
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
		class={heading2?.isActive ? 'bg-accent text-accent-foreground' : ''}
		disabled={!heading2?.canExec}
		onclick={() => currentEditor?.commands.toggleHeading({ level: 2 })}
		aria-label="Heading"
		title="Heading"
		type="button"
	>
		<Heading2 class="size-4" />
	</Button>
	<Button
		variant="ghost"
		size="icon"
		class={paragraph?.isActive ? 'bg-accent text-accent-foreground' : ''}
		disabled={!paragraph?.canExec}
		onclick={() => currentEditor?.commands.setParagraph()}
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
		class={bulletList?.isActive ? 'bg-accent text-accent-foreground' : ''}
		disabled={!bulletList?.canExec}
		onclick={() => currentEditor?.commands.toggleList({ kind: 'bullet' })}
		aria-label="Bullet list"
		title="Bullet list"
		type="button"
	>
		<List class="size-4" />
	</Button>
	<Button
		variant="ghost"
		size="icon"
		class={orderedList?.isActive ? 'bg-accent text-accent-foreground' : ''}
		disabled={!orderedList?.canExec}
		onclick={() => currentEditor?.commands.toggleList({ kind: 'ordered' })}
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
		disabled={!undo?.canExec}
		onclick={() => currentEditor?.commands.undo()}
		aria-label="Undo"
		title="Undo"
		type="button"
	>
		<Undo2 class="size-4" />
	</Button>
	<Button
		variant="ghost"
		size="icon"
		disabled={!redo?.canExec}
		onclick={() => currentEditor?.commands.redo()}
		aria-label="Redo"
		title="Redo"
		type="button"
	>
		<Redo2 class="size-4" />
	</Button>
</div>
