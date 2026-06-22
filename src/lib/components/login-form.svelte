<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { browser } from '$app/environment';
	import { authClient } from '$lib/auth-client.js';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { authSignInFormSchema, authSignUpFormSchema, type AuthForm } from '$lib/forms/schemas.js';
	import { Loader2 } from '@lucide/svelte';
	import { page } from '$app/state';
	import { getOAuthErrorMessage } from '$lib/auth-errors.js';

	interface Props {
		mode?: 'signin' | 'signup';
	}

	const { mode = 'signin' }: Props = $props();

	const authEmailCtx = getContext<{ get: () => string; set: (v: string) => void }>('auth:email');

	let isSignUp = $derived(mode === 'signup');
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let oauthError = $derived(getOAuthErrorMessage(page.url.searchParams.get('error')));
	const form = superForm<AuthForm>(
		{
			name: '',
			email: authEmailCtx?.get() ?? '',
			password: ''
		},
		{
			validators: zodClient(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(() => (mode === 'signup' ? authSignUpFormSchema : authSignInFormSchema))() as any
			)
		}
	);
	const { form: formData, errors } = form;

	let hasErrors = $state(false);
	$effect(() => {
		const unsub = errors.subscribe((e) => {
			hasErrors = !!(e && Object.values(e).some((v) => Array.isArray(v) && v.length > 0));
		});
		return unsub;
	});

	$effect(() => {
		authEmailCtx?.set($formData.email);
	});

	function getAuthErrorMessage(message: string | undefined, fallback: string) {
		if (!message) return fallback;
		const normalizedMessage = message.toLowerCase();
		if (normalizedMessage.includes('already exists')) {
			return 'An account with this email already exists. Sign in instead.';
		}
		return message;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isLoading = true;
		error = null;

		try {
			if (isSignUp) {
				const validation = authSignUpFormSchema.safeParse($formData);
				if (!validation.success) {
					error = validation.error.issues[0]?.message ?? 'Check the form and try again.';
					return;
				}

				const formValues = validation.data;
				await authClient.signUp.email(
					{
						name: formValues.name,
						email: formValues.email,
						password: formValues.password,
						callbackURL: resolve('/onboarding')
					},
					{
						onSuccess: () => {
							if (browser) {
								window.location.assign(resolve('/onboarding'));
							}
						},
						onError: (ctx) => {
							error = getAuthErrorMessage(ctx.error.message, 'Unable to create account.');
						}
					}
				);
			} else {
				const validation = authSignInFormSchema.safeParse($formData);
				if (!validation.success) {
					error = validation.error.issues[0]?.message ?? 'Check the form and try again.';
					return;
				}

				const formValues = validation.data;
				await authClient.signIn.email(
					{ email: formValues.email, password: formValues.password },
					{
						onSuccess: () => {
							if (browser) {
								window.location.assign(resolve('/dashboard'));
							}
						},
						onError: (ctx) => {
							error = getAuthErrorMessage(ctx.error.message, 'Unable to sign in.');
						}
					}
				);
			}
		} catch (err) {
			error = 'An unexpected error occurred';
			console.error('Auth error:', err);
		} finally {
			isLoading = false;
		}
	}

	async function handleGoogleLogin() {
		error = null;
		try {
			await authClient.signIn.social({
				provider: 'google',
				callbackURL: resolve('/dashboard'),
				errorCallbackURL: resolve('/auth/sign-in')
			});
		} catch (err) {
			error = 'Failed to sign in with Google';
			console.error('Google auth error:', err);
		}
	}
</script>

<Card.Root class="w-full border-0 shadow-none lg:border lg:shadow-sm">
	<Card.Header class="space-y-1 pb-4">
		<Card.Title class="text-2xl font-semibold tracking-tight">
			{isSignUp ? 'Create an account' : 'Welcome back'}
		</Card.Title>
		<Card.Description class="text-base text-muted-foreground">
			{isSignUp
				? 'Enter your details to get started'
				: 'Enter your credentials to access your account'}
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<form onsubmit={handleSubmit} class="space-y-4">
			{#if error || oauthError}
				<div
					class="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
				>
					{error ?? oauthError}
				</div>
			{/if}

			{#if isSignUp}
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label class="text-sm font-medium">Name</Form.Label>
							<Input
								{...props}
								type="text"
								bind:value={$formData.name}
								required
								placeholder="Alex Chen"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			{/if}

			<Form.Field {form} name="email">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="text-sm font-medium">Email</Form.Label>
						<Input
							{...props}
							type="email"
							placeholder="alex@example.com"
							bind:value={$formData.email}
							required
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="password">
				<Form.Control>
					{#snippet children({ props })}
						<div class="flex items-center justify-between">
							<Form.Label class="text-sm font-medium">Password</Form.Label>
							{#if !isSignUp}
								<a
									href={resolve('/auth/forgot-password')}
									class="text-sm text-muted-foreground hover:text-primary"
								>
									Forgot password?
								</a>
							{/if}
						</div>
						<Input
							{...props}
							type="password"
							bind:value={$formData.password}
							required
							placeholder={isSignUp ? 'At least 8 characters' : 'Enter your password'}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Button type="submit" class="w-full gap-2" disabled={isLoading || hasErrors}>
				{#if isLoading}
					<Loader2 class="size-4 animate-spin" />
				{/if}
				{isSignUp ? 'Create account' : 'Sign in'}
			</Button>

			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<span class="w-full border-t"></span>
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-background px-2 text-muted-foreground">Or continue with</span>
				</div>
			</div>

			<Button variant="outline" class="w-full gap-2" type="button" onclick={handleGoogleLogin}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-4">
					<path
						d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
						fill="currentColor"
					/>
				</svg>
				Google
			</Button>
		</form>

		<div class="mt-6 text-center text-sm text-muted-foreground">
			{#if isSignUp}
				Already have an account?
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={resolve('/auth/sign-in')} class="font-medium text-foreground hover:text-primary"
					>Sign in</a
				>
			{:else}
				Don't have an account?
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={resolve('/auth/sign-up')} class="font-medium text-foreground hover:text-primary"
					>Create one</a
				>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
