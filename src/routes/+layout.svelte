<script lang="ts">
	import '../app.css';
	import '@uppy/core/css/style.min.css';
	import '@uppy/dashboard/css/style.min.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import { createSvelteAuthClient } from '@mmailaender/convex-better-auth-svelte/svelte';
	import { authClient } from '$lib/auth-client';
	import { APP_NAME, APP_DESCRIPTION, APP_THEME_COLOR } from '$lib/constants';
	import { pwaInfo } from 'virtual:pwa-info';
	import PwaReloadPrompt from '$lib/components/pwa-reload-prompt.svelte';
	createSvelteAuthClient({ authClient });

	let { children } = $props();

	let webManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html webManifest}
	<meta name="theme-color" content={APP_THEME_COLOR} />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="apple-mobile-web-app-title" content={APP_NAME} />
	<meta name="description" content={APP_DESCRIPTION} />
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" href="/pwa-192x192.png" />
</svelte:head>

<ModeWatcher />

{@render children?.()}

<PwaReloadPrompt />
