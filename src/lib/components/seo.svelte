<script lang="ts">
	import {
		APP_DESCRIPTION,
		APP_NAME,
		APP_OG_IMAGE_URL,
		APP_TWITTER_CARD,
		APP_URL
	} from '$lib/constants';

	interface Props {
		title?: string;
		description?: string;
		canonical?: string;
		image?: string;
		robots?: string;
		type?: 'website' | 'article';
		schema?: Record<string, unknown> | Array<Record<string, unknown>>;
	}

	let {
		title = APP_NAME,
		description = APP_DESCRIPTION,
		canonical = APP_URL,
		image = APP_OG_IMAGE_URL,
		robots = 'index,follow',
		type = 'website',
		schema
	}: Props = $props();
	let fullTitle = $derived(title === APP_NAME ? title : `${title} | ${APP_NAME}`);
	let schemaJson = $derived(schema ? JSON.stringify(schema).replaceAll('<', '\\u003c') : '');
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta name="robots" content={robots} />
	<link rel="canonical" href={canonical} />
	<meta property="og:site_name" content={APP_NAME} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={image} />
	<meta name="twitter:card" content={APP_TWITTER_CARD} />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
	{#if schemaJson}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON is escaped above before insertion. -->
		{@html `<script type="application/ld+json">${schemaJson}</${'script'}>`}
	{/if}
</svelte:head>
