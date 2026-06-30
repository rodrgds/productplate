<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { APP_NAME } from '$lib/constants.js';
	import { api } from '$convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { MailCheck } from '@lucide/svelte';

	const convex = useConvexClient();
	let token = $derived(page.params.token ?? '');
	const inviteResponse = useQuery(api.organizations.getInviteByToken, () =>
		token ? { token } : 'skip'
	);
	let invite = $derived(inviteResponse.data);
	let message = $state('');
	let error = $state('');
	let isAccepting = $state(false);

	async function acceptInvite() {
		if (!token) return;
		isAccepting = true;
		message = '';
		error = '';
		try {
			await convex.mutation(api.organizations.acceptInvite, { token });
			message = 'Invite accepted.';
			await goto(resolve('/workspace'));
		} catch (cause) {
			error = cause instanceof Error ? cause.message : String(cause);
		} finally {
			isAccepting = false;
		}
	}
</script>

<svelte:head>
	<title>Accept invite | {APP_NAME}</title>
</svelte:head>

<header
	class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium">Accept Invite</h1>
	</div>
</header>

<main class="flex flex-1 items-start p-4 lg:p-6">
	<Card.Root class="w-full max-w-xl">
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<MailCheck class="size-5 text-primary" />
				Workspace invite
			</Card.Title>
			<Card.Description>
				{#if inviteResponse.isLoading}
					Loading invite...
				{:else if invite}
					You were invited to join {invite.organization.name} as {invite.invite.role}.
				{:else}
					This invite is invalid, expired, or revoked.
				{/if}
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#if invite}
				<div class="rounded-lg border p-4 text-sm">
					<p class="font-medium">{invite.invite.email}</p>
					<p class="text-muted-foreground">Role: {invite.invite.role}</p>
				</div>
				<Button onclick={acceptInvite} disabled={isAccepting}>
					{isAccepting ? 'Accepting...' : 'Accept invite'}
				</Button>
			{/if}
			{#if message}
				<p class="text-sm text-primary">{message}</p>
			{/if}
			{#if error}
				<p class="text-sm text-destructive">{error}</p>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
