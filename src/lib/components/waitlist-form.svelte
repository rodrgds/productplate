<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { getBrowserTelemetry } from '$lib/telemetry-browser';

	let status = $state<'idle' | 'submitting' | 'accepted' | 'error'>('idle');
	let message = $state('');

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const body = new SvelteURLSearchParams();
		for (const [key, value] of new FormData(form)) {
			if (typeof value === 'string') body.append(key, value);
		}
		status = 'submitting';
		message = '';
		const response = await fetch(form.action, {
			method: 'POST',
			body,
			headers: { accept: 'application/json' }
		});
		const result = (await response.json()) as { accepted: boolean; error?: string };
		if (response.ok && result.accepted) {
			status = 'accepted';
			message = 'You are on the list.';
			getBrowserTelemetry(env.PUBLIC_POSTHOG_KEY, env.PUBLIC_POSTHOG_HOST).capture(
				'waitlist_subscribed',
				{ path: location.pathname, source: 'landing' }
			);
			form.reset();
		} else {
			status = 'error';
			message = result.error ?? 'Unable to join right now.';
		}
	}
</script>

<form
	method="POST"
	action="/api/waitlist"
	onsubmit={submit}
	class="flex w-full max-w-xl flex-col gap-3 sm:flex-row"
>
	<label class="sr-only" for="waitlist-email">Email address</label>
	<input
		id="waitlist-email"
		name="email"
		type="email"
		autocomplete="email"
		placeholder="you@example.com"
		required
		maxlength="320"
		class="h-11 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
	/>
	<input name="source" type="hidden" value="landing" />
	<div class="absolute -left-[10000px]" aria-hidden="true">
		<label for="waitlist-website">Website</label>
		<input id="waitlist-website" name="website" type="text" tabindex="-1" autocomplete="off" />
	</div>
	<button
		type="submit"
		disabled={status === 'submitting'}
		class="h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60"
	>
		{status === 'submitting' ? 'Joining…' : 'Join waitlist'}
	</button>
</form>
{#if message}
	<p
		class="mt-3 text-sm {status === 'error' ? 'text-destructive' : 'text-muted-foreground'}"
		role="status"
	>
		{message}
	</p>
{/if}
