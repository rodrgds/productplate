<script lang="ts">
	import { Streamdown } from 'streamdown-svelte';

	interface Props {
		text: string;
	}

	const { text }: Props = $props();
</script>

<div class="prose prose-sm dark:prose-invert max-w-none">
	<Streamdown content={text} parseIncompleteMarkdown={true} />
</div>
