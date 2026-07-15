<script lang="ts">
	import { APP_NAME } from '$lib/constants.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { api } from '$convex/_generated/api.js';
	import { authClient } from '$lib/auth-client.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { onboardingFormSchema } from '$lib/forms/schemas.js';
	import { useConvexClient } from 'convex-svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import {
		PartyPopper,
		UserRoundPen,
		Sparkles,
		Building2,
		FlaskConical,
		FileText
	} from '@lucide/svelte';
	import { confetti } from '@neoconfetti/svelte';
	import { onDestroy } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import type { OnboardingForm } from '$lib/forms/schemas.js';

	const convex = useConvexClient();
	let isSubmitting = $state(false);
	let completed = $state(false);
	let error = $state<string | null>(null);
	let redirectTimer: ReturnType<typeof setTimeout> | null = null;

	onDestroy(() => {
		if (redirectTimer) clearTimeout(redirectTimer);
	});

	const form = superForm<OnboardingForm>(
		{
			displayName: '',
			bio: '',
			role: '',
			workspaceName: ''
		},
		{
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			validators: zodClient(onboardingFormSchema as any),
			SPA: true,
			onUpdate: async ({ form: validatedForm }) => {
				if (!validatedForm.valid) return;

				isSubmitting = true;
				error = null;
				try {
					await authClient.updateUser({
						name: validatedForm.data.displayName
					});
					await convex.mutation(api.organizations.completeOnboarding, validatedForm.data);
					completed = true;
					redirectTimer = setTimeout(() => {
						goto(resolve('/dashboard'));
					}, 2000);
				} catch (err) {
					error = err instanceof Error ? err.message : 'Unable to complete onboarding.';
				} finally {
					isSubmitting = false;
				}
			}
		}
	);

	const { form: formData, enhance, errors } = form;

	let hasErrors = $state(false);
	$effect(() => {
		const unsub = errors.subscribe((e) => {
			hasErrors = !!(e && Object.values(e).some((v) => Array.isArray(v) && v.length > 0));
		});
		return unsub;
	});
</script>

<svelte:head>
	<title>Onboarding | {APP_NAME}</title>
</svelte:head>

<main class="relative flex min-h-screen items-center justify-center bg-muted/30 p-4">
	{#if completed}
		<div class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
			<div use:confetti></div>
		</div>
	{/if}

	<div class="w-full max-w-2xl">
		<Card.Root class="border shadow-lg">
			<Card.Header class="space-y-4 pb-6">
				<div
					class="flex size-12 items-center justify-center rounded-xl border bg-background shadow-sm"
				>
					<UserRoundPen class="size-5 text-primary" />
				</div>
				<div class="space-y-1.5">
					<Card.Title role="heading" aria-level={1} class="text-2xl font-semibold tracking-tight"
						>Set up your workspace</Card.Title
					>
					<Card.Description class="text-base text-muted-foreground">
						A few baseline profile fields keep this starter ready for your product.
					</Card.Description>
				</div>
			</Card.Header>
			<Card.Content>
				<form method="POST" use:enhance class="space-y-6">
					{#if error}
						<div
							class="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
						>
							{error}
						</div>
					{/if}

					<div class="grid gap-6 sm:grid-cols-2">
						<div class="space-y-2">
							<Form.Field {form} name="displayName">
								<Form.Control>
									{#snippet children({ props })}
										<div class="flex items-center gap-2">
											<Sparkles class="size-4 text-muted-foreground" />
											<Form.Label class="text-sm font-medium">Display name</Form.Label>
										</div>
										<Input
											{...props}
											bind:value={$formData.displayName}
											autocomplete="name"
											placeholder="Alex Chen"
										/>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>

						<div class="space-y-2">
							<Form.Field {form} name="workspaceName">
								<Form.Control>
									{#snippet children({ props })}
										<div class="flex items-center gap-2">
											<Building2 class="size-4 text-muted-foreground" />
											<Form.Label class="text-sm font-medium">Workspace</Form.Label>
										</div>
										<Input {...props} bind:value={$formData.workspaceName} placeholder="Acme Lab" />
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</div>
					</div>

					<div class="space-y-2">
						<Form.Field {form} name="role">
							<Form.Control>
								{#snippet children({ props })}
									<div class="flex items-center gap-2">
										<FlaskConical class="size-4 text-muted-foreground" />
										<Form.Label class="text-sm font-medium"
											>What are you building toward?</Form.Label
										>
									</div>
									<Input
										{...props}
										bind:value={$formData.role}
										placeholder="Prototype, product, research"
									/>
								{/snippet}
							</Form.Control>
							<Form.Description class="text-xs text-muted-foreground"
								>This can become a theme-specific field later.</Form.Description
							>
							<Form.FieldErrors />
						</Form.Field>
					</div>

					<div class="space-y-2">
						<Form.Field {form} name="bio">
							<Form.Control>
								{#snippet children({ props })}
									<div class="flex items-center gap-2">
										<FileText class="size-4 text-muted-foreground" />
										<Form.Label class="text-sm font-medium">Short bio</Form.Label>
									</div>
									<textarea
										{...props}
										bind:value={$formData.bio}
										rows="4"
										class="min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
										placeholder="A quick note about you or your team."
									></textarea>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>

					<div class="flex items-center justify-end gap-3 pt-2">
						<Button
							type="submit"
							size="lg"
							disabled={isSubmitting || completed || hasErrors}
							class="gap-2"
						>
							{#if completed}
								<PartyPopper class="size-4" />
								<span>Complete</span>
							{:else}
								<span>Finish onboarding</span>
							{/if}
						</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	</div>
</main>
