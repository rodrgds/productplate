<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import type { ComponentProps } from 'svelte';

	let { ...restProps }: ComponentProps<typeof Command.Input> = $props();
</script>

<Command.Input placeholder="Search microphones..." {...restProps} />
