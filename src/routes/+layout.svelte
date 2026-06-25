<script lang="ts">
	import '../app.css';
	import '@uppy/core/css/style.min.css';
	import '@uppy/dashboard/css/style.min.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import { createSvelteAuthClient } from '@mmailaender/convex-better-auth-svelte/svelte';
	import { authClient } from '$lib/auth-client';
	import {
		APP_DESCRIPTION,
		APP_KEYWORDS,
		APP_NAME,
		APP_OG_IMAGE_URL,
		APP_SOCIAL_DESCRIPTION,
		APP_SOCIAL_TITLE,
		APP_THEME_COLOR,
		APP_TWITTER_CARD,
		APP_URL
	} from '$lib/constants';
	import { pwaInfo } from 'virtual:pwa-info';
	import PwaReloadPrompt from '$lib/components/pwa-reload-prompt.svelte';
	createSvelteAuthClient({ authClient });

	let { children } = $props();

	let webManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html webManifest}
	<title>{APP_SOCIAL_TITLE}</title>
	<meta name="description" content={APP_DESCRIPTION} />
	<meta name="keywords" content={APP_KEYWORDS.join(', ')} />
	<meta name="application-name" content={APP_NAME} />
	<meta name="theme-color" content={APP_THEME_COLOR} />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="apple-mobile-web-app-title" content={APP_NAME} />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href={APP_URL} />
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" href="/pwa-192x192.png" />
	<meta property="og:site_name" content={APP_NAME} />
	<meta property="og:title" content={APP_SOCIAL_TITLE} />
	<meta property="og:description" content={APP_SOCIAL_DESCRIPTION} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={APP_URL} />
	<meta property="og:image" content={APP_OG_IMAGE_URL} />
	<meta property="og:image:secure_url" content={APP_OG_IMAGE_URL} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Product Plate — ship the product, not the setup" />
	<meta name="twitter:card" content={APP_TWITTER_CARD} />
	<meta name="twitter:title" content={APP_SOCIAL_TITLE} />
	<meta name="twitter:description" content={APP_SOCIAL_DESCRIPTION} />
	<meta name="twitter:image" content={APP_OG_IMAGE_URL} />
	<meta name="twitter:image:alt" content="Product Plate — ship the product, not the setup" />
</svelte:head>

<ModeWatcher />

{@render children?.()}

<PwaReloadPrompt />
