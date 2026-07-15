<script lang="ts">
	import { APP_NAME, APP_URL } from '$lib/constants.js';
	import { FilePenLine } from '@lucide/svelte';
	import PublicPageShell from '$lib/components/public-page-shell.svelte';
</script>

<svelte:head>
	<title>Blog | {APP_NAME}</title>
	<meta
		name="description"
		content="Product Plate articles about SvelteKit product architecture and starter-template decisions."
	/>
	<meta name="robots" content="noindex, follow" />
	<link rel="canonical" href={`${APP_URL}/blog`} />
</svelte:head>

<PublicPageShell>
	<main id="main-content" class="mx-auto max-w-5xl px-6 py-16">
		<div class="mb-10 space-y-3">
			<p class="text-sm font-medium text-primary">Blog</p>
			<h1 class="text-4xl font-semibold tracking-tight">Notes from the starter</h1>
		</div>
		<div class="rounded-xl border border-dashed bg-muted/20 p-10 text-center sm:p-16">
			<FilePenLine class="mx-auto size-8 text-muted-foreground" />
			<h2 class="mt-4 text-lg font-semibold">No published posts yet</h2>
			<p class="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
				This route is an intentionally empty starter surface. Publish real product writing here or
				remove the route during kickstart.
			</p>
		</div>
	</main>
</PublicPageShell>
