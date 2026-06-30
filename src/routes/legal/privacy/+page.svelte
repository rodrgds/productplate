<script lang="ts">
	import { APP_LEGAL_NAME, APP_NAME, APP_URL } from '$lib/constants.js';
</script>

<svelte:head>
	<title>Privacy Policy | {APP_NAME}</title>
	<meta name="description" content="Product Plate privacy policy template for product forks." />
	<link rel="canonical" href={`${APP_URL}/legal/privacy`} />
</svelte:head>

<main class="mx-auto max-w-3xl space-y-6 px-6 py-16">
	<p class="text-sm font-medium text-primary">Legal</p>
	<h1 class="text-4xl font-semibold tracking-tight">Privacy Policy</h1>
	<p class="text-muted-foreground">
		This is a starter policy for {APP_LEGAL_NAME}. Replace it with counsel-reviewed language before
		production launch.
	</p>
	<section class="space-y-3 text-sm leading-6 text-muted-foreground">
		<p>
			We collect account, authentication, billing, usage, and support information needed to operate
			the product.
		</p>
		<p>
			We use trusted processors for hosting, database, authentication, billing, email, and
			analytics.
		</p>
		<p>
			Users can request access, correction, export, or deletion through the product support channel.
		</p>
	</section>
</main>
