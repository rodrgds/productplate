<script lang="ts">
	import { APP_LEGAL_NAME, APP_NAME, APP_URL } from '$lib/constants.js';
	import PublicPageShell from '$lib/components/public-page-shell.svelte';
</script>

<svelte:head>
	<title>Terms of Service | {APP_NAME}</title>
	<meta name="description" content="Product Plate terms of service template for product forks." />
	<meta name="robots" content="noindex, follow" />
	<link rel="canonical" href={`${APP_URL}/legal/terms`} />
</svelte:head>

<PublicPageShell>
	<main id="main-content" class="mx-auto max-w-3xl space-y-6 px-6 py-16">
		<p class="text-sm font-medium text-primary">Legal</p>
		<h1 class="text-4xl font-semibold tracking-tight">Terms of Service</h1>
		<p class="text-muted-foreground">
			These starter terms are placeholders for {APP_LEGAL_NAME}. Replace them before charging
			customers.
		</p>
		<section class="space-y-3 text-sm leading-6 text-muted-foreground">
			<p>Customers are responsible for their account access, workspace content, and API keys.</p>
			<p>
				The service may include third-party infrastructure for authentication, billing, email,
				analytics, and storage.
			</p>
			<p>
				Paid plans, cancellation, refunds, uptime commitments, and liability limits should match
				your actual offer.
			</p>
		</section>
	</main>
</PublicPageShell>
