<script lang="ts">
	import { Streamdown, createMathPlugin } from 'streamdown-svelte';

	interface Props {
		text: string;
	}

	const { text }: Props = $props();

	const plugins = {
		math: createMathPlugin({ singleDollarTextMath: true })
	};
</script>

<div class="prose prose-sm dark:prose-invert max-w-none">
	<Streamdown content={text} {plugins} parseIncompleteMarkdown={true} />
</div>
