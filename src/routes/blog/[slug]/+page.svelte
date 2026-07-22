<script lang="ts">
	import { APP_URL } from '$lib/constants';
	import PublicPageShell from '$lib/components/public-page-shell.svelte';
	import Seo from '$lib/components/seo.svelte';
	import type { Component } from 'svelte';
	import type { PageData } from './$types';

	interface BlogModule {
		default: Component;
	}

	let { data }: { data: PageData } = $props();
	const modules = import.meta.glob<BlogModule>('/content/blog/*.svx', { eager: true });
	let Content = $derived(modules[`/content/blog/${data.post.slug}.svx`]?.default);
	let articleSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: data.post.title,
		description: data.post.description,
		datePublished: data.post.published,
		dateModified: data.post.updated ?? data.post.published,
		author: { '@type': 'Person', name: data.post.author },
		url: data.post.canonicalUrl
	});
</script>

<Seo
	title={data.post.title}
	description={data.post.description}
	canonical={data.post.canonicalUrl}
	image={data.post.socialImage.startsWith('http')
		? data.post.socialImage
		: `${APP_URL}${data.post.socialImage}`}
	type="article"
	schema={articleSchema}
/>

<PublicPageShell
	title={data.post.title}
	eyebrow={data.post.published}
	description={data.post.description}
>
	<article class="prose prose-neutral dark:prose-invert max-w-none">
		{#if Content}<Content />{/if}
	</article>
</PublicPageShell>
