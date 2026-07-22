<script lang="ts">
	import { resolve } from '$app/paths';
	import { APP_NAME, APP_URL } from '$lib/constants';
	import PublicPageShell from '$lib/components/public-page-shell.svelte';
	import Seo from '$lib/components/seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Seo
	title="Blog"
	description={`Product notes from ${APP_NAME}.`}
	canonical={`${APP_URL}/blog`}
	robots={data.posts.length === 0 ? 'noindex,follow' : 'index,follow'}
/>

<PublicPageShell
	title="Blog"
	eyebrow="Writing"
	description="Product notes, release context, and practical guides."
>
	{#if data.posts.length === 0}
		<div class="rounded-xl border border-dashed p-8 text-muted-foreground">
			No posts are published yet. This page stays out of search results until the first article
			ships.
		</div>
	{:else}
		<div class="grid gap-5">
			{#each data.posts as post (post.slug)}
				<article class="rounded-xl border p-6">
					<p class="text-sm text-muted-foreground">{post.published} · {post.author}</p>
					<h2 class="mt-2 text-2xl font-semibold">
						<a href={resolve('/blog/[slug]', { slug: post.slug })}>{post.title}</a>
					</h2>
					<p class="mt-3 text-muted-foreground">{post.description}</p>
				</article>
			{/each}
		</div>
	{/if}
</PublicPageShell>
