<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
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
		try {
			const response = await fetch(form.action, {
				method: 'POST',
				body,
				headers: { accept: 'application/json' }
			});
			const result = (await response.json()) as { accepted: boolean; error?: string };
			if (!response.ok || !result.accepted) {
				status = 'error';
				message = result.error ?? 'Unable to join right now.';
				return;
			}

			status = 'accepted';
			message = 'You are on the list.';
			getBrowserTelemetry(env.PUBLIC_POSTHOG_KEY, env.PUBLIC_POSTHOG_HOST).capture(
				'waitlist_subscribed',
				{ path: location.pathname, source: 'landing' }
			);
			form.reset();
		} catch {
			status = 'error';
			message = 'Unable to join right now. Try again in a moment.';
		}
	}
</script>

<form
	method="POST"
	action="/api/waitlist"
	onsubmit={submit}
	class="flex w-full max-w-xl flex-col items-stretch gap-3 sm:flex-row"
	aria-busy={status === 'submitting'}
>
	<label class="sr-only" for="waitlist-email">Email address</label>
	<Input
		id="waitlist-email"
		name="email"
		type="email"
		autocomplete="email"
		placeholder="you@example.com"
		required
		maxlength={320}
		aria-describedby={message ? 'waitlist-status' : undefined}
		class="h-11 w-full sm:flex-1"
	/>
	<input name="source" type="hidden" value="landing" />
	<div class="absolute -left-[10000px]" aria-hidden="true">
		<label for="waitlist-website">Website</label>
		<input id="waitlist-website" name="website" type="text" tabindex="-1" autocomplete="off" />
	</div>
	<Button type="submit" disabled={status === 'submitting'} class="h-11 w-full px-5 sm:w-auto">
		{status === 'submitting' ? 'Joining…' : 'Join waitlist'}
	</Button>
</form>
{#if message}
	<p
		id="waitlist-status"
		class="mt-3 text-sm {status === 'error' ? 'text-destructive' : 'text-muted-foreground'}"
		role="status"
		aria-live="polite"
	>
		{message}
	</p>
{/if}
