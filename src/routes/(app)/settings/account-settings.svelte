<script lang="ts">
	import { authClient } from '$lib/auth-client.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { toast } from 'svelte-sonner';
	import { api } from '$convex/_generated/api.js';
	import { useConvexClient } from 'convex-svelte';
	import { Upload, Camera, Trash2 } from '@lucide/svelte';
	import * as Form from '$lib/components/ui/form/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { accountFormSchema, type AccountForm } from '$lib/forms/schemas.js';
	import ProfileImageEditor from '$lib/components/profile-image-editor.svelte';
	import { ExternalLink } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	interface Props {
		user: {
			id?: string;
			name?: string;
			email?: string;
			image?: string | null;
		} | null;
		profile: {
			displayName?: string;
			bio?: string;
		} | null;
	}

	let { user, profile }: Props = $props();

	let isLoading = $state(false);
	let isEditorOpen = $state(false);

	const convexClient = useConvexClient();
	const form = superForm<AccountForm>(
		(() => ({
			name: profile?.displayName || user?.name || '',
			image: user?.image || '',
			bio: profile?.bio || ''
		}))(),
		{
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			validators: zodClient(accountFormSchema as any),
			onSubmit: async ({ cancel }) => {
				cancel();
				isLoading = true;
				try {
					await authClient.updateUser({
						name: $formData.name,
						image: $formData.image || null
					});
					const updatedProfile = await convexClient.mutation(api.userProfiles.updateCurrent, {
						displayName: $formData.name,
						bio: $formData.bio,
						image: $formData.image || undefined
					});
					$formData.name = updatedProfile.displayName;
					$formData.bio = updatedProfile.bio;
					$formData.image = updatedProfile.image || '';
					toast.success('Profile updated successfully');
				} catch (error) {
					const message = error instanceof Error ? error.message : 'Failed to update profile';
					toast.error(message);
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

	$effect(() => {
		if (user) {
			$formData.name = profile?.displayName || user.name || '';
			$formData.image = user.image || '';
			$formData.bio = profile?.bio || '';
		}
	});

	async function onUploadComplete(imageUrl: string) {
		$formData.image = imageUrl;
		try {
			await authClient.updateUser({
				image: imageUrl
			});
			toast.success('Profile picture updated');
		} catch (error) {
			console.error('Failed to update user image:', error);
		}
	}

	async function handleRemoveImage() {
		isLoading = true;
		try {
			await convexClient.mutation(api.storage.removeCurrentProfileImage, {});
			await authClient.updateUser({
				image: null
			});
			$formData.image = '';
			toast.success('Profile picture removed');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to remove image';
			toast.error(message);
		} finally {
			isLoading = false;
		}
	}
</script>

<ProfileImageEditor bind:open={isEditorOpen} {onUploadComplete} />

<Card.Root>
	<Card.Header>
		<Card.Title>Account Information</Card.Title>
		<Card.Description>Update your account information here.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance class="space-y-6">
			<!-- Profile Picture Section -->
			<div class="flex flex-col gap-6 sm:flex-row sm:items-center">
				<div class="group relative">
					{#if $formData.image}
						<img
							src={$formData.image}
							alt="Profile preview"
							class="h-24 w-24 rounded-full border-2 border-border bg-muted object-cover"
							onerror={(e) => {
								const target = e.target as HTMLImageElement;
								target.style.display = 'none';
							}}
						/>
					{:else}
						<div
							class="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted text-xs text-muted-foreground"
						>
							No image
						</div>
					{/if}
					<button
						type="button"
						onclick={() => (isEditorOpen = true)}
						class="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
						aria-label="Change profile picture"
					>
						<Camera class="size-6" />
					</button>
				</div>

				<div class="flex-1 space-y-1.5">
					<p class="text-sm font-semibold">Profile picture</p>
					<p class="max-w-sm text-sm text-muted-foreground">
						Click the avatar to upload a new one. We'll help you crop it to a perfect circle.
					</p>
					<div class="flex gap-2 pt-2">
						<Button type="button" variant="outline" size="sm" onclick={() => (isEditorOpen = true)}>
							<Upload class="mr-2 size-3.5" />
							Change Picture
						</Button>
						{#if $formData.image}
							<Button
								type="button"
								variant="ghost"
								size="sm"
								class="text-destructive hover:bg-destructive/10 hover:text-destructive"
								onclick={handleRemoveImage}
								disabled={isLoading}
							>
								<Trash2 class="mr-2 size-3.5" />
								Remove
							</Button>
						{/if}
					</div>
				</div>
			</div>

			<Separator />

			<div class="space-y-4">
				<Form.Field {form} name="name">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name</Form.Label>
							<Input {...props} type="text" bind:value={$formData.name} required />
						{/snippet}
					</Form.Control>
					<Form.Description>This is your public display name.</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="bio">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Bio</Form.Label>
							<textarea
								{...props}
								bind:value={$formData.bio}
								rows="4"
								class="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
							></textarea>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<div class="flex items-center justify-between">
				<Button type="submit" disabled={isLoading || hasErrors} class="w-full sm:w-auto">
					{isLoading ? 'Saving...' : 'Save Changes'}
				</Button>
				{#if user?.id}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => goto(resolve(`/profile/${user.id}`))}
					>
						<ExternalLink class="mr-2 size-3.5" />
						View Public Profile
					</Button>
				{/if}
			</div>
		</form>
	</Card.Content>
</Card.Root>
