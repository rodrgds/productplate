<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import { getBrowserTelemetry } from '$lib/telemetry-browser';

	let visible = $state(false);
	let telemetry: ReturnType<typeof getBrowserTelemetry> | undefined;

	onMount(() => {
		if (!env.PUBLIC_POSTHOG_KEY) return;
		telemetry = getBrowserTelemetry(env.PUBLIC_POSTHOG_KEY, env.PUBLIC_POSTHOG_HOST);
		visible = telemetry.getConsent() === 'required';
	});

	function choose(consent: 'granted' | 'denied') {
		telemetry?.setConsent(consent);
		visible = false;
	}
</script>

{#if visible}
	<aside
		class="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-xl rounded-lg border bg-background p-4 shadow-xl sm:left-auto"
		aria-label="Analytics preference"
	>
		<p class="text-sm leading-6 text-muted-foreground">
			Allow anonymous product analytics? We do not send email addresses, form text, prompts, or user
			content.
		</p>
		<div class="mt-3 flex gap-2">
			<button
				class="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
				onclick={() => choose('granted')}
			>
				Allow
			</button>
			<button class="rounded-md border px-3 py-2 text-sm" onclick={() => choose('denied')}
				>Decline</button
			>
		</div>
	</aside>
{/if}
