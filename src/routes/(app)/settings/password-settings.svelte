<script lang="ts">
	import { authClient } from '$lib/auth-client.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { toast } from 'svelte-sonner';
	import { Info } from '@lucide/svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { passwordFormSchema, type PasswordForm } from '$lib/forms/schemas.js';

	let isLoading = $state(false);
	let error = $state('');
	const form = superForm<PasswordForm>(
		{
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
			revokeOtherSessions: true
		},
		{
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			validators: zodClient(passwordFormSchema as any),
			async onSubmit() {
				isLoading = true;
				error = '';

				try {
					const { error: authError } = await authClient.changePassword({
						currentPassword: $formData.currentPassword,
						newPassword: $formData.newPassword,
						revokeOtherSessions: $formData.revokeOtherSessions
					});

					if (authError) {
						error = authError.message || 'Failed to change password';
						toast.error(error);
					} else {
						toast.success('Password changed successfully');
						$formData.currentPassword = '';
						$formData.newPassword = '';
						$formData.confirmPassword = '';
					}
				} catch (err) {
					error = err instanceof Error ? err.message : 'An unexpected error occurred';
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
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Change Password</Card.Title>
		<Card.Description>Update your password to keep your account secure.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" class="space-y-4" use:enhance>
			{#if error}
				<Alert.Root variant="destructive">
					<Info class="h-4 w-4" />
					<Alert.Title>Error</Alert.Title>
					<Alert.Description>{error}</Alert.Description>
				</Alert.Root>
			{/if}

			<Form.Field {form} name="currentPassword">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Current Password</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formData.currentPassword}
							placeholder="Enter current password"
							required
							autocomplete="current-password"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="newPassword">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>New Password</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formData.newPassword}
							placeholder="Enter new password"
							required
							autocomplete="new-password"
						/>
					{/snippet}
				</Form.Control>
				<p class="text-sm text-muted-foreground">Must be at least 8 characters long.</p>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field {form} name="confirmPassword">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Confirm New Password</Form.Label>
						<Input
							{...props}
							type="password"
							bind:value={$formData.confirmPassword}
							placeholder="Confirm new password"
							required
							autocomplete="new-password"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="flex items-center gap-2">
				<Checkbox id="revoke-sessions" bind:checked={$formData.revokeOtherSessions} />
				<label
					for="revoke-sessions"
					class="text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Sign out of all other devices
				</label>
			</div>

			<Alert.Root>
				<Info class="h-4 w-4" />
				<Alert.Title>Security Notice</Alert.Title>
				<Alert.Description>
					Changing your password will require you to sign in again on all devices unless you uncheck
					the option above.
				</Alert.Description>
			</Alert.Root>

			<Button type="submit" disabled={isLoading || hasErrors}>
				{isLoading ? 'Updating...' : 'Update Password'}
			</Button>
		</form>
	</Card.Content>
</Card.Root>
