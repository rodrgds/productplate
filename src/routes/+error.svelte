<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import AppLogo from '$lib/components/app-logo.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { APP_NAME } from '$lib/constants.js';
</script>

<svelte:head>
	<title>{page.status} | {APP_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="grid min-h-screen place-items-center bg-muted/20 px-6 py-16">
	<div class="w-full max-w-lg text-center">
		<AppLogo class="mx-auto size-12 rounded-xl" />
		<p class="mt-8 text-sm font-medium text-primary">Error {page.status}</p>
		<h1 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
			{page.status === 404 ? 'This page is not part of the starter.' : 'Something went wrong.'}
		</h1>
		<p class="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">
			{page.error?.message ?? 'The request could not be completed. Try again from a known route.'}
		</p>
		<div class="mt-8 flex flex-wrap justify-center gap-3">
			<Button href={resolve('/')}>Return home</Button>
			<Button href={resolve('/docs')} variant="outline">Open docs</Button>
		</div>
	</div>
</main>
