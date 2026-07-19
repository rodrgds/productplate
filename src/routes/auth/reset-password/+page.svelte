<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { authClient } from '$lib/auth-client.js';
	import { resolve } from '$app/paths';
	import { Loader2, ArrowLeft, CheckCircle2 } from '@lucide/svelte';

	let password = $state('');
	let confirmPassword = $state('');
	let isLoading = $state(false);
	let message = $state<string | null>(null);
	let error = $state<string | null>(null);

	function getTokenFromUrl() {
		try {
			const url = new URL(window.location.href);
			return url.searchParams.get('token');
		} catch {
			return null;
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = null;
		message = null;
		if (password.length < 8) {
			error = 'Enter a password with at least 8 characters.';
			return;
		}
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}
		const token = getTokenFromUrl();
		if (!token) {
			error = 'This reset link is missing or invalid.';
			return;
		}
		isLoading = true;
		try {
			const { error: err } = await authClient.resetPassword({
				newPassword: password,
				token
			});
			if (err) {
				error = err.message ?? 'Reset failed';
			} else {
				message = 'Your password has been reset. You can now sign in.';
			}
		} catch {
			error = 'Could not reset the password.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center px-4">
	<Card.Root class="mx-auto w-full max-w-sm border-0 shadow-none lg:border lg:shadow-sm">
		<Card.Header class="space-y-1 pb-4">
			<Card.Title class="text-2xl font-semibold tracking-tight">Reset password</Card.Title>
			<Card.Description class="text-base text-muted-foreground">
				Enter your new password below
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
						<div class="flex items-center gap-2">
							<CheckCircle2 class="size-4" />
							<span>{message}</span>
						</div>
						<div class="mt-2">
							<a
								href={resolve('/auth/sign-in')}
								class="font-medium text-foreground underline hover:text-primary"
							>
								Sign in
							</a>
						</div>
					</div>
				{/if}
				<div class="space-y-2">
					<Label for="password" class="text-sm font-medium">New password</Label>
					<Input
						id="password"
						type="password"
						bind:value={password}
						required
						placeholder="At least 8 characters"
					/>
				</div>
				<div class="space-y-2">
					<Label for="confirm" class="text-sm font-medium">Confirm new password</Label>
					<Input
						id="confirm"
						type="password"
						bind:value={confirmPassword}
						required
						placeholder="Repeat password"
					/>
				</div>
				<Button type="submit" class="w-full gap-2" disabled={isLoading}>
					{#if isLoading}
						<Loader2 class="size-4 animate-spin" />
					{/if}
					Reset password
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
