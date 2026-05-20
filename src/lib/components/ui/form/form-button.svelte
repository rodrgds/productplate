<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import type { ComponentProps } from 'svelte';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Button> = $props();
</script>

<Button bind:ref type="submit" {...restProps} />
