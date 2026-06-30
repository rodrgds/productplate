<script lang="ts">
	import { APP_DESCRIPTION, APP_NAME, APP_URL } from '$lib/constants.js';
</script>

<svelte:head>
	<title>Docs | {APP_NAME}</title>
	<meta
		name="description"
		content="Product Plate setup, architecture, and production handoff documentation."
	/>
	<link rel="canonical" href={`${APP_URL}/docs`} />
</svelte:head>

<main class="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
	<section class="max-w-3xl space-y-4">
		<p class="text-sm font-medium text-primary">Documentation</p>
		<h1 class="text-4xl font-semibold tracking-tight">Build from a real product surface.</h1>
		<p class="text-lg text-muted-foreground">{APP_DESCRIPTION}</p>
	</section>

	<section class="grid gap-4 md:grid-cols-3">
		{#each [['Start', 'Run Bun, Convex, Better Auth, and the guided kickstart flow.'], ['Customize', 'Choose a stack path, theme, billing model, and demo cleanup plan.'], ['Ship', 'Use tests, Cloudflare deployment, API keys, webhooks, and operator screens.']] as item (item[0])}
			<article class="rounded-lg border bg-card p-5">
				<h2 class="font-semibold">{item[0]}</h2>
				<p class="mt-2 text-sm text-muted-foreground">{item[1]}</p>
			</article>
		{/each}
	</section>

	<section class="grid gap-3 text-sm text-muted-foreground">
		<h2 class="text-xl font-semibold text-foreground">Core paths</h2>
		<p><code>START_HERE.md</code> guides product discovery and stack selection.</p>
		<p>
			<code>src/routes/(app)</code> contains dashboard, settings, billing, workspace, developer, and
			admin surfaces.
		</p>
		<p>
			<code>src/convex</code> contains auth, billing, organizations, entitlements, notifications, API
			keys, and webhooks.
		</p>
		<p>
			<code>docs/observability-security.md</code> covers request logging, security headers, and secret-handling
			defaults.
		</p>
	</section>
</main>
