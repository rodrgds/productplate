<script lang="ts">
	import { APP_NAME } from '$lib/constants.js';
	import { api } from '$convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { Bell, Building2, Check, Copy, MailPlus, ShieldCheck, Users } from '@lucide/svelte';
	import type { Id } from '$convex/_generated/dataModel.js';

	const convex = useConvexClient();
	const workspaceResponse = useQuery(api.organizations.getCurrent, {});

	let workspace = $derived(workspaceResponse.data);
	let inviteEmail = $state('');
	let inviteRole = $state<'admin' | 'member' | 'viewer'>('member');
	let message = $state('');
	let error = $state('');
	let isBusy = $state(false);
	let copiedInviteId = $state('');

	function formatDate(value: number) {
		return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(value);
	}

	async function runAction(action: () => Promise<unknown>, success: string) {
		isBusy = true;
		error = '';
		message = '';
		try {
			await action();
			message = success;
		} catch (cause) {
			error = cause instanceof Error ? cause.message : String(cause);
		} finally {
			isBusy = false;
		}
	}

	async function ensureWorkspace() {
		await runAction(
			() =>
				convex.mutation(api.organizations.ensureCurrent, { workspaceName: 'Product workspace' }),
			'Workspace created.'
		);
	}

	async function inviteMember() {
		if (!workspace) return;

		isBusy = true;
		error = '';
		message = '';
		try {
			const invite = await convex.mutation(api.organizations.inviteMember, {
				orgId: workspace.organization._id,
				email: inviteEmail,
				role: inviteRole
			});

			let deliveryStatus = 'Invite email sent.';
			try {
				const delivery = await convex.action(api.emails.sendWorkspaceInvite, {
					to: invite.email,
					organizationName: workspace.organization.name,
					inviteUrl: inviteUrl(invite.token)
				});
				if (delivery.status === 'preview') {
					deliveryStatus = 'Email is in preview mode; copy the invite link.';
				}
			} catch (cause) {
				console.warn('Workspace invite email failed:', cause);
				deliveryStatus = 'Email delivery failed; copy the invite link.';
			}

			message = `Invite created. ${deliveryStatus}`;
			inviteEmail = '';
		} catch (cause) {
			error = cause instanceof Error ? cause.message : String(cause);
		} finally {
			isBusy = false;
		}
	}

	async function updateRole(
		memberId: Id<'organizationMembers'>,
		role: 'admin' | 'member' | 'viewer'
	) {
		await runAction(
			() => convex.mutation(api.organizations.updateMemberRole, { memberId, role }),
			'Member role updated.'
		);
	}

	async function removeMember(memberId: Id<'organizationMembers'>) {
		await runAction(
			() => convex.mutation(api.organizations.removeMember, { memberId }),
			'Member removed.'
		);
	}

	async function revokeInvite(inviteId: Id<'organizationInvites'>) {
		await runAction(
			() => convex.mutation(api.organizations.revokeInvite, { inviteId }),
			'Invite revoked.'
		);
	}

	async function markNotificationsRead() {
		await runAction(
			() => convex.mutation(api.notifications.markAllRead, {}),
			'Notifications marked as read.'
		);
	}

	function inviteUrl(token: string) {
		const origin = typeof location === 'undefined' ? '' : location.origin;
		return `${origin}/invite/${token}`;
	}

	async function copyInvite(inviteId: Id<'organizationInvites'>, token: string) {
		await navigator.clipboard.writeText(inviteUrl(token));
		copiedInviteId = inviteId;
		setTimeout(() => {
			if (copiedInviteId === inviteId) copiedInviteId = '';
		}, 1800);
	}
</script>

<svelte:head>
	<title>Workspace | {APP_NAME}</title>
</svelte:head>

<header
	class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium">Workspace</h1>
		{#if workspace}
			<Badge variant="secondary" class="ml-auto">{workspace.members.length} members</Badge>
		{/if}
	</div>
</header>

<main class="flex flex-1 flex-col gap-4 p-4 lg:p-6">
	{#if workspaceResponse.isLoading && !workspace}
		<Card.Root>
			<Card.Content class="p-6 text-sm text-muted-foreground">Loading workspace...</Card.Content>
		</Card.Root>
	{:else if !workspace}
		<Card.Root class="max-w-xl">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Building2 class="size-5 text-primary" />
					Create your workspace
				</Card.Title>
				<Card.Description>
					Initialize organizations, members, entitlements, notifications, API keys, and webhooks for
					this signed-in user.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<Button onclick={ensureWorkspace} disabled={isBusy}>Create workspace</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
			<div class="grid gap-4">
				<Card.Root>
					<Card.Header class="border-b">
						<Card.Title class="flex items-center gap-2 text-base">
							<Users class="size-4 text-primary" />
							Members
						</Card.Title>
						<Card.Description
							>{workspace.organization.name} role-based access control.</Card.Description
						>
					</Card.Header>
					<Card.Content class="p-0">
						<div class="divide-y">
							{#each workspace.members as member (member._id)}
								<div class="grid gap-3 p-4 md:grid-cols-[1fr_160px_auto] md:items-center">
									<div>
										<p class="font-medium">{member.displayName ?? member.email}</p>
										<p class="text-sm text-muted-foreground">{member.email}</p>
									</div>
									<select
										class="h-9 rounded-md border bg-background px-2 text-sm"
										value={member.role}
										disabled={member.role === 'owner' || isBusy}
										onchange={(event) =>
											updateRole(
												member._id,
												event.currentTarget.value as 'admin' | 'member' | 'viewer'
											)}
									>
										<option value="owner" disabled>Owner</option>
										<option value="admin">Admin</option>
										<option value="member">Member</option>
										<option value="viewer">Viewer</option>
									</select>
									<Button
										variant="outline"
										size="sm"
										disabled={member.role === 'owner' || isBusy}
										onclick={() => removeMember(member._id)}
									>
										Remove
									</Button>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="border-b">
						<Card.Title class="flex items-center gap-2 text-base">
							<ShieldCheck class="size-4 text-primary" />
							Entitlements
						</Card.Title>
						<Card.Description
							>Feature gates and limits a billing integration can update.</Card.Description
						>
					</Card.Header>
					<Card.Content class="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
						{#each workspace.entitlements as entitlement (entitlement._id)}
							<div class="rounded-lg border p-4">
								<div class="flex items-center justify-between gap-2">
									<p class="font-medium">{entitlement.key.replaceAll('_', ' ')}</p>
									<Badge variant={entitlement.enabled ? 'default' : 'secondary'}>
										{entitlement.enabled ? 'On' : 'Off'}
									</Badge>
								</div>
								<p class="mt-2 text-sm text-muted-foreground">
									{entitlement.usage}{entitlement.limit ? ` / ${entitlement.limit}` : ''} used
								</p>
								<p class="mt-1 text-xs text-muted-foreground">Source: {entitlement.source}</p>
							</div>
						{/each}
					</Card.Content>
				</Card.Root>
			</div>

			<div class="grid gap-4 self-start">
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2 text-base">
							<MailPlus class="size-4 text-primary" />
							Invite
						</Card.Title>
						<Card.Description>Create a token-backed invite for a teammate.</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-3">
						<input
							class="h-9 w-full rounded-md border bg-background px-3 text-sm"
							bind:value={inviteEmail}
							placeholder="teammate@example.com"
						/>
						<select
							class="h-9 w-full rounded-md border bg-background px-2 text-sm"
							bind:value={inviteRole}
						>
							<option value="admin">Admin</option>
							<option value="member">Member</option>
							<option value="viewer">Viewer</option>
						</select>
						<Button class="w-full" onclick={inviteMember} disabled={!inviteEmail || isBusy}
							>Create invite</Button
						>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="border-b">
						<Card.Title class="text-base">Pending invites</Card.Title>
					</Card.Header>
					<Card.Content class="p-0">
						{#if workspace.invites.length === 0}
							<p class="p-4 text-sm text-muted-foreground">No pending invites.</p>
						{:else}
							<div class="divide-y">
								{#each workspace.invites as invite (invite._id)}
									<div class="flex items-center justify-between gap-3 p-4">
										<div>
											<p class="text-sm font-medium">{invite.email}</p>
											<p class="text-xs text-muted-foreground">
												{invite.role} · expires {formatDate(invite.expiresAt)}
											</p>
										</div>
										<div class="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												onclick={() => copyInvite(invite._id, invite.token)}
											>
												{#if copiedInviteId === invite._id}
													<Check />
													Copied
												{:else}
													<Copy />
													Copy
												{/if}
											</Button>
											<Button variant="outline" size="sm" onclick={() => revokeInvite(invite._id)}>
												Revoke
											</Button>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="border-b">
						<Card.Title class="flex items-center gap-2 text-base">
							<Bell class="size-4 text-primary" />
							Notifications
						</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-3 p-4">
						{#each workspace.notifications as notification (notification._id)}
							<div class="rounded-lg border p-3 text-sm">
								<div class="flex items-center justify-between gap-2">
									<p class="font-medium">{notification.title}</p>
									{#if !notification.readAt}
										<span class="size-2 rounded-full bg-primary"></span>
									{/if}
								</div>
								<p class="mt-1 text-muted-foreground">{notification.body}</p>
							</div>
						{:else}
							<p class="text-sm text-muted-foreground">No notifications yet.</p>
						{/each}
						<Button variant="outline" class="w-full" onclick={markNotificationsRead}
							>Mark all read</Button
						>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{/if}

	{#if message}
		<p class="text-sm text-primary">{message}</p>
	{/if}
	{#if error}
		<p class="text-sm text-destructive">{error}</p>
	{/if}
</main>
