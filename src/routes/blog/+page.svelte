<script lang="ts">
	import { APP_NAME, APP_URL } from '$lib/constants.js';

	const posts = [
		[
			'What a serious SvelteKit starter should include',
			'A practical checklist for teams, billing, webhooks, SEO, tests, and deployment.'
		],
		[
			'Keeping demos disposable',
			'How Product Plate keeps hosted demos useful without leaking into product forks.'
		],
		[
			'Theme systems for product templates',
			'Why a starter needs configurable tokens before it needs another hero section.'
		]
	];
</script>

<svelte:head>
	<title>Blog | {APP_NAME}</title>
	<meta
		name="description"
		content="Product Plate articles about SvelteKit product architecture and starter-template decisions."
	/>
	<link rel="canonical" href={`${APP_URL}/blog`} />
</svelte:head>

<main class="mx-auto max-w-5xl px-6 py-16">
	<div class="mb-10 space-y-3">
		<p class="text-sm font-medium text-primary">Blog</p>
		<h1 class="text-4xl font-semibold tracking-tight">Notes from the starter</h1>
	</div>
	<div class="grid gap-4 md:grid-cols-3">
		{#each posts as post (post[0])}
			<article class="rounded-lg border bg-card p-5">
				<h2 class="font-semibold">{post[0]}</h2>
				<p class="mt-2 text-sm text-muted-foreground">{post[1]}</p>
			</article>
		{/each}
	</div>
</main>
