<script lang="ts">
	import { DEFAULT_LOGO_PATH } from '$lib/constants.js';

	let { class: className = '', ...restProps }: { class?: string } & Record<string, unknown> =
		$props();
</script>

<img src={DEFAULT_LOGO_PATH} alt="App logo" class={className} {...restProps} />
