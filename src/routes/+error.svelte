<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import AppLogo from '$lib/components/app-logo.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { APP_NAME } from '$lib/constants.js';

	let copied = $state(false);
	let requestId = $derived(page.error?.requestId);

	async function copyRequestId() {
		if (!requestId) return;
		await navigator.clipboard.writeText(requestId);
		copied = true;
	}
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
			{page.status === 404
				? 'This route is not included in the starter.'
				: 'We could not load this page'}
		</h1>
		<p class="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">
			{page.error?.message ?? 'The request could not be completed. Try again, or return home.'}
		</p>
		{#if requestId}
			<button
				type="button"
				onclick={copyRequestId}
				class="mt-4 rounded-md border px-3 py-2 font-mono text-xs text-muted-foreground hover:text-foreground"
			>
				{copied ? 'Request ID copied' : `Copy request ID: ${requestId}`}
			</button>
		{/if}
		<div class="mt-8 flex flex-wrap justify-center gap-3">
			<Button href={resolve('/')}>Return home</Button>
			{#if page.data.supportEmail}
				<Button
					href={`mailto:${page.data.supportEmail}?subject=${encodeURIComponent(`${APP_NAME} support request${requestId ? ` ${requestId}` : ''}`)}`}
					variant="outline">Contact support</Button
				>
			{:else}
				<Button href={resolve('/docs')} variant="outline">Open docs</Button>
			{/if}
		</div>
	</div>
</main>
