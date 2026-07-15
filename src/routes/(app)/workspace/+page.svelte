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
	import type { Doc, Id } from '$convex/_generated/dataModel.js';
	import { toast } from 'svelte-sonner';

	const convex = useConvexClient();
	const currentUserResponse = useQuery(api.auth.getCurrentUser, {});
	const workspaceResponse = useQuery(api.organizations.getCurrent, {});
	const administrationResponse = useQuery(api.organizations.getMemberAdministration, {});
	const billingResponse = useQuery(api.organizations.getBillingOverview, {});
	const notificationsResponse = useQuery(api.notifications.listCurrent, { limit: 10 });

	let clientCurrentUser = $derived(currentUserResponse.data);
	let workspace = $derived(workspaceResponse.data);
	let administration = $derived(administrationResponse.data);
	let entitlements = $derived(billingResponse.data?.entitlements ?? []);
	let unreadNotifications = $derived(
		(notificationsResponse.data ?? []).filter(
			(notification: Doc<'notifications'>) => !notification.readAt
		)
	);
	let inviteEmail = $state('');
	let inviteRole = $state<'admin' | 'member' | 'viewer'>('member');
	let error = $state('');
	let isBusy = $state(false);
	let copiedInviteId = $state('');

	function formatDate(value: number) {
		return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(value);
	}

	async function runAction(action: () => Promise<unknown>, success: string) {
		isBusy = true;
		error = '';
		try {
			await action();
			toast.success(success);
		} catch (cause) {
			error = cause instanceof Error ? cause.message : String(cause);
			toast.error(error);
		} finally {
			isBusy = false;
		}
	}

	async function ensureWorkspace() {
		if (!clientCurrentUser) {
			error = currentUserResponse.isLoading
				? 'Your session is still connecting. Try again in a moment.'
				: 'Sign in again before creating a workspace.';
			return;
		}
		await runAction(
			() => convex.mutation(api.organizations.ensureCurrent, {}),
			'Workspace created.'
		);
	}

	function inviteUrl(token: string) {
		const origin = typeof location === 'undefined' ? '' : location.origin;
		return `${origin}/invite/${token}`;
	}

	async function inviteMember() {
		if (!workspace || !administration) return;
		isBusy = true;
		error = '';
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
				if (delivery.status === 'preview') deliveryStatus = 'Copy the preview invite link.';
			} catch {
				deliveryStatus = 'Email delivery failed; copy the invite link.';
			}
			toast.success(`Invite created. ${deliveryStatus}`);
			inviteEmail = '';
		} catch (cause) {
			error = cause instanceof Error ? cause.message : String(cause);
			toast.error(error);
		} finally {
			isBusy = false;
		}
	}

	async function copyInvite(inviteId: Id<'organizationInvites'>, token: string) {
		await navigator.clipboard.writeText(inviteUrl(token));
		copiedInviteId = inviteId;
		toast.success('Invite link copied.');
		setTimeout(() => {
			if (copiedInviteId === inviteId) copiedInviteId = '';
		}, 1800);
	}
</script>

<svelte:head><title>Workspace | {APP_NAME}</title></svelte:head>

<header class="flex h-16 shrink-0 items-center gap-2 border-b">
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium">Workspace</h1>
		{#if administration}
			<Badge variant="secondary" class="ml-auto">{administration.members.length} members</Badge>
		{/if}
	</div>
</header>

<main class="flex min-w-0 flex-1 flex-col gap-4 bg-muted/20 p-4 lg:p-6">
	{#if workspaceResponse.isLoading && !workspace}
		<Card.Root class="gap-0 py-0"
			><Card.Content class="p-6 text-sm text-muted-foreground">Loading workspace...</Card.Content
			></Card.Root
		>
	{:else if !workspace}
		<Card.Root class="max-w-xl gap-0 py-0">
			<Card.Header class="p-4 pb-3">
				<Card.Title class="flex items-center gap-2"
					><Building2 class="size-5 text-primary" />Create your workspace</Card.Title
				>
				<Card.Description>Initialize the workspace for this signed-in user.</Card.Description>
			</Card.Header>
			<Card.Content class="p-4 pt-0"
				><Button onclick={ensureWorkspace} disabled={isBusy || !clientCurrentUser}
					>{currentUserResponse.isLoading ? 'Preparing session...' : 'Create workspace'}</Button
				></Card.Content
			>
		</Card.Root>
	{:else}
		<div class="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
			<div class="grid min-w-0 auto-rows-max gap-4">
				<Card.Root class="min-w-0 gap-0 overflow-hidden py-0">
					<Card.Header class="border-b p-4">
						<Card.Title class="flex items-center gap-2 text-base"
							><Users class="size-4 text-primary" />Members</Card.Title
						>
						<Card.Description
							>{workspace.organization.name} role-based access control.</Card.Description
						>
					</Card.Header>
					<Card.Content class="p-0">
						{#if administration}
							<div class="divide-y">
								{#each administration.members as member (member._id)}
									<div
										class="grid min-w-0 gap-3 p-4 md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-center"
									>
										<div class="min-w-0">
											<p class="font-medium">{member.displayName ?? member.email}</p>
											<p class="text-sm break-all text-muted-foreground">{member.email}</p>
										</div>
										<label class="sr-only" for={`role-${member._id}`}
											>Role for {member.displayName ?? member.email}</label
										>
										<select
											id={`role-${member._id}`}
											class="h-9 rounded-md border bg-background px-2 text-sm"
											value={member.role}
											disabled={member.role === 'owner' || isBusy}
											onchange={(event) =>
												runAction(
													() =>
														convex.mutation(api.organizations.updateMemberRole, {
															memberId: member._id,
															role: event.currentTarget.value as 'admin' | 'member' | 'viewer'
														}),
													'Member role updated.'
												)}
										>
											<option value="owner" disabled>Owner</option><option value="admin"
												>Admin</option
											><option value="member">Member</option><option value="viewer">Viewer</option>
										</select>
										<Button
											variant="outline"
											size="sm"
											disabled={member.role === 'owner' || isBusy}
											onclick={() =>
												runAction(
													() =>
														convex.mutation(api.organizations.removeMember, {
															memberId: member._id
														}),
													'Member removed.'
												)}>Remove</Button
										>
									</div>
								{/each}
							</div>
						{:else}
							<p class="p-4 text-sm text-muted-foreground">
								Your {workspace.membership.role} role does not include member administration.
							</p>
						{/if}
					</Card.Content>
				</Card.Root>

				{#if entitlements.length > 0}
					<Card.Root class="min-w-0 gap-0 overflow-hidden py-0">
						<Card.Header class="border-b p-4"
							><Card.Title class="flex items-center gap-2 text-base"
								><ShieldCheck class="size-4 text-primary" />Entitlements</Card.Title
							><Card.Description>Billing-controlled feature gates and limits.</Card.Description
							></Card.Header
						>
						<Card.Content class="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
							{#each entitlements as entitlement (entitlement._id)}
								<div class="rounded-lg border p-4">
									<div class="flex items-center justify-between gap-2">
										<p class="font-medium">{entitlement.key.replaceAll('_', ' ')}</p>
										<Badge variant={entitlement.enabled ? 'default' : 'secondary'}
											>{entitlement.enabled ? 'On' : 'Off'}</Badge
										>
									</div>
									<p class="mt-2 text-sm text-muted-foreground">
										{entitlement.usage}{entitlement.limit ? ` / ${entitlement.limit}` : ''} used
									</p>
								</div>
							{/each}
						</Card.Content>
					</Card.Root>
				{/if}
			</div>

			<div class="grid min-w-0 auto-rows-max gap-4">
				{#if administration}
					<Card.Root class="gap-0 py-0">
						<Card.Header class="p-4 pb-3"
							><Card.Title class="flex items-center gap-2 text-base"
								><MailPlus class="size-4 text-primary" />Invite</Card.Title
							><Card.Description>Create a token-backed invite.</Card.Description></Card.Header
						>
						<Card.Content class="flex flex-col gap-3 p-4 pt-0">
							<label class="sr-only" for="invite-email">Teammate email</label><input
								id="invite-email"
								class="h-10 w-full rounded-md border bg-background px-3 text-sm"
								bind:value={inviteEmail}
								type="email"
								autocomplete="email"
								placeholder="teammate@example.com"
							/>
							<label class="sr-only" for="invite-role">Teammate role</label><select
								id="invite-role"
								class="h-10 w-full rounded-md border bg-background px-2 text-sm"
								bind:value={inviteRole}
								><option value="admin">Admin</option><option value="member">Member</option><option
									value="viewer">Viewer</option
								></select
							>
							<Button
								class="min-h-10 w-full"
								onclick={inviteMember}
								disabled={!inviteEmail || isBusy}>Create invite</Button
							>
						</Card.Content>
					</Card.Root>
					<Card.Root class="gap-0 py-0"
						><Card.Header class="border-b p-4"
							><Card.Title class="text-base">Pending invites</Card.Title></Card.Header
						><Card.Content class="p-0">
							{#each administration.invites as invite (invite._id)}
								<div
									class="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b p-4 last:border-0"
								>
									<div class="min-w-0">
										<p class="text-sm font-medium break-all">{invite.email}</p>
										<p class="text-xs text-muted-foreground">
											{invite.role} · expires {formatDate(invite.expiresAt)}
										</p>
									</div>
									<div class="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											onclick={() => copyInvite(invite._id, invite.token)}
											>{#if copiedInviteId === invite._id}<Check />Copied{:else}<Copy
												/>Copy{/if}</Button
										><Button
											variant="outline"
											size="sm"
											onclick={() =>
												runAction(
													() =>
														convex.mutation(api.organizations.revokeInvite, {
															inviteId: invite._id
														}),
													'Invite revoked.'
												)}>Revoke</Button
										>
									</div>
								</div>
							{:else}<p class="p-4 text-sm text-muted-foreground">No pending invites.</p>{/each}
						</Card.Content></Card.Root
					>
				{/if}

				<Card.Root class="gap-0 py-0"
					><Card.Header class="border-b p-4"
						><Card.Title class="flex items-center gap-2 text-base"
							><Bell class="size-4 text-primary" />Notifications</Card.Title
						></Card.Header
					><Card.Content class="flex flex-col gap-3 p-4">
						{#each unreadNotifications as notification (notification._id)}<div
								class="rounded-lg border p-3 text-sm"
							>
								<p class="font-medium">{notification.title}</p>
								<p class="mt-1 text-muted-foreground">{notification.body}</p>
							</div>{:else}<p class="text-sm text-muted-foreground">
								No unread notifications.
							</p>{/each}
						<Button
							variant="outline"
							class="w-full"
							disabled={unreadNotifications.length === 0 || isBusy}
							onclick={() =>
								runAction(
									() => convex.mutation(api.notifications.markAllRead, {}),
									'Notifications read.'
								)}>Mark all read</Button
						>
					</Card.Content></Card.Root
				>
			</div>
		</div>
	{/if}
	{#if error}<p class="text-sm text-destructive" role="alert" aria-live="polite">{error}</p>{/if}
</main>
