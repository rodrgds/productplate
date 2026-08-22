<script lang="ts">
	import { DEFAULT_LOGO_PATH } from '$lib/constants.js';

	// img attributes beyond class pass through to the host element.
	type LogoImageAttributes = { class?: string } & Record<string, string | number | boolean>;

	let { class: className = '', ...restProps }: LogoImageAttributes = $props();
</script>

<img src={DEFAULT_LOGO_PATH} alt="App logo" class={className} {...restProps} />
