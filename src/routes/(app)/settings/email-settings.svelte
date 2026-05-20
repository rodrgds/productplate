<script lang="ts">
	import { authClient } from '$lib/auth-client.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { toast } from 'svelte-sonner';
	import { Info, CircleCheck } from '@lucide/svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { emailFormSchema, type EmailForm } from '$lib/forms/schemas.js';

	interface Props {
		user: {
			email?: string;
			emailVerified?: boolean;
		} | null;
	}

	let { user }: Props = $props();

	let isLoading = $state(false);
	let error = $state('');

	const form = superForm<EmailForm>(
		{ newEmail: '' },
		{
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			validators: zodClient(emailFormSchema as any),
			async onSubmit({ cancel }) {
				cancel();

				if ($formData.newEmail === currentEmail) {
					error = 'New email must be different from current email';
					return;
				}

				isLoading = true;
				error = '';

				try {
					await authClient.changeEmail({
						newEmail: $formData.newEmail,
						callbackURL: '/settings?email-changed=true'
					});

					toast.success(
						isEmailVerified
							? 'Verification email sent to your current address. Please check your inbox to approve the change.'
							: 'Email updated successfully'
					);

					$formData.newEmail = '';
				} catch (err) {
					error = err instanceof Error ? err.message : 'Failed to change email';
					toast.error(error);
				} finally {
					isLoading = false;
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

	let currentEmail = $derived(user?.email || '');
	let isEmailVerified = $derived(user?.emailVerified || false);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Email Address</Card.Title>
		<Card.Description>
			Update your email address for account notifications and login.
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="space-y-4">
			<!-- Current Email Display -->
			<div class="space-y-2">
				<Label for="current-email">Current Email</Label>
				<div class="flex items-center gap-2">
					<Input id="current-email" value={currentEmail} disabled class="bg-muted" />
					{#if isEmailVerified}
						<Badge variant="secondary" class="flex items-center gap-1">
							<CircleCheck class="h-3 w-3" />
							Verified
						</Badge>
					{:else}
						<Badge variant="outline">Unverified</Badge>
					{/if}
				</div>
			</div>

			<form method="POST" use:enhance class="space-y-4">
				{#if error}
					<Alert.Root variant="destructive">
						<Info class="h-4 w-4" />
						<Alert.Title>Error</Alert.Title>
						<Alert.Description>{error}</Alert.Description>
					</Alert.Root>
				{/if}

				<Form.Field {form} name="newEmail">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>New Email Address</Form.Label>
							<Input
								{...props}
								type="email"
								bind:value={$formData.newEmail}
								placeholder="Enter new email address"
								required
								autocomplete="email"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				{#if isEmailVerified}
					<Alert.Root>
						<Info class="h-4 w-4" />
						<Alert.Title>Verification Required</Alert.Title>
						<Alert.Description>
							A verification email will be sent to your current email address. You must approve the
							change before your new email becomes active.
						</Alert.Description>
					</Alert.Root>
				{:else}
					<Alert.Root>
						<Info class="h-4 w-4" />
						<Alert.Title>Email Not Verified</Alert.Title>
						<Alert.Description>
							Your current email is not verified. The new email will be updated immediately without
							verification.
						</Alert.Description>
					</Alert.Root>
				{/if}

				<Button type="submit" disabled={isLoading || hasErrors}>
					{isLoading ? 'Updating...' : 'Update Email'}
				</Button>
			</form>
		</div>
	</Card.Content>
</Card.Root>
