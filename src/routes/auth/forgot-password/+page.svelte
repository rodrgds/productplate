<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { authClient } from '$lib/auth-client.js';
	import { getContext } from 'svelte';
	import { Loader2, ArrowLeft } from '@lucide/svelte';
	import { resolve } from '$app/paths';

	const authEmailCtx = getContext<{ get: () => string; set: (v: string) => void }>('auth:email');
	let email = $state(authEmailCtx?.get() ?? '');
	let isLoading = $state(false);
	let message = $state<string | null>(null);
	let error = $state<string | null>(null);

	$effect(() => {
		authEmailCtx?.set(email);
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isLoading = true;
		message = null;
		error = null;
		try {
			const { error: err } = await authClient.requestPasswordReset({
				email,
				redirectTo: '/auth/reset-password'
			});
			if (err) {
				error = err.message ?? 'Request failed';
			} else {
				message = 'Check your email for a reset link.';
			}
		} catch {
			error = 'Failed to request password reset';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<Card.Root class="mx-auto w-full max-w-sm border-0 shadow-none lg:border lg:shadow-sm">
		<Card.Header class="space-y-1 pb-4">
			<Card.Title class="text-2xl font-semibold tracking-tight">Forgot password</Card.Title>
			<Card.Description class="text-base text-muted-foreground">
				Enter your email and we'll send you a reset link
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={handleSubmit} class="space-y-4">
				{#if error}
					<div
						class="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
					>
						{error}
					</div>
				{/if}
				{#if message}
					<div
						class="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700"
					>
						{message}
					</div>
				{/if}
				<div class="space-y-2">
					<Label for="email" class="text-sm font-medium">Email</Label>
					<Input
						id="email"
						type="email"
						bind:value={email}
						required
						placeholder="you@example.com"
					/>
				</div>
				<Button type="submit" class="w-full gap-2" disabled={isLoading}>
					{#if isLoading}
						<Loader2 class="size-4 animate-spin" />
					{/if}
					Send reset link
				</Button>
			</form>
			<div class="mt-6 text-center text-sm text-muted-foreground">
				<a
					href={resolve('/auth/sign-in')}
					class="inline-flex items-center gap-1 font-medium text-foreground hover:text-primary"
				>
					<ArrowLeft class="size-3" />
					Back to sign in
				</a>
			</div>
		</Card.Content>
	</Card.Root>
</div>
