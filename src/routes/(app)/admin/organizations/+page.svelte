<script lang="ts">
	import { APP_NAME } from '$lib/constants.js';
	import { api } from '$convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useConvexClient, usePaginatedQuery } from 'convex-svelte';
	import { Building2, ShieldCheck } from '@lucide/svelte';
	import type { Id } from '$convex/_generated/dataModel.js';

	const convex = useConvexClient();
	const organizationsResponse = usePaginatedQuery(
		api.organizations.adminListOrganizations,
		() => ({}),
		{ initialNumItems: 10 }
	);

	let rows = $derived(organizationsResponse.results);
	let entitlementKey = $state('advanced_admin');
	let entitlementEnabled = $state(true);
	let entitlementLimit = $state('');
	let targetOrgId = $state('');
	let message = $state('');
	let error = $state('');

	async function saveEntitlement() {
		if (!targetOrgId) return;
		message = '';
		error = '';
		try {
			const args: {
				orgId: Id<'organizations'>;
				key: string;
				enabled: boolean;
				limit?: number;
			} = {
				orgId: targetOrgId as Id<'organizations'>,
				key: entitlementKey,
				enabled: entitlementEnabled
			};
			if (entitlementLimit) args.limit = Number(entitlementLimit);

			await convex.mutation(api.organizations.adminSetEntitlement, args);
			message = 'Entitlement updated.';
		} catch (cause) {
			error = cause instanceof Error ? cause.message : String(cause);
		}
	}
</script>

<svelte:head>
	<title>Organizations | Admin | {APP_NAME}</title>
</svelte:head>

<header
	class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium">Organizations</h1>
	</div>
</header>

<main class="grid flex-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-6">
	<Card.Root class="self-start">
		<Card.Header class="border-b">
			<Card.Title class="flex items-center gap-2 text-base">
				<Building2 class="size-4 text-primary" />
				Workspaces
			</Card.Title>
			<Card.Description
				>Operator-level overview of organizations and billing-controlled gates.</Card.Description
			>
		</Card.Header>
		<Card.Content class="p-0">
			{#if organizationsResponse.isLoading}
				<p class="p-4 text-sm text-muted-foreground">Loading organizations...</p>
			{:else if rows.length === 0}
				<p class="p-4 text-sm text-muted-foreground">No organizations yet.</p>
			{:else}
				<div class="divide-y">
					{#each rows as row (row.organization._id)}
						<button
							type="button"
							class="grid w-full gap-3 p-4 text-left hover:bg-muted/50 md:grid-cols-[1fr_auto]"
							onclick={() => (targetOrgId = row.organization._id)}
						>
							<div>
								<div class="flex flex-wrap items-center gap-2">
									<p class="font-medium">{row.organization.name}</p>
									<Badge variant="secondary">{row.organization.planKey}</Badge>
									{#if row.subscription}
										<Badge variant={row.subscription.source === 'billing' ? 'default' : 'outline'}>
											{row.subscription.source}
										</Badge>
									{/if}
								</div>
								<p class="text-sm text-muted-foreground">{row.organization.slug}</p>
								<p class="mt-2 text-xs text-muted-foreground">
									{row.members.length} members · {row.entitlements.length} entitlements
									{#if row.subscription}
										· subscription {row.subscription.status}
									{/if}
								</p>
							</div>
							<div class="flex flex-wrap gap-2 md:justify-end">
								{#each row.entitlements.slice(0, 4) as entitlement (entitlement._id)}
									<Badge variant={entitlement.enabled ? 'default' : 'secondary'}>
										{entitlement.key}
									</Badge>
								{/each}
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</Card.Content>
		{#if organizationsResponse.status === 'CanLoadMore'}
			<Card.Footer class="border-t">
				<Button variant="outline" onclick={() => organizationsResponse.loadMore(10)}>
					Load more workspaces
				</Button>
			</Card.Footer>
		{/if}
	</Card.Root>

	<Card.Root class="self-start">
		<Card.Header>
			<Card.Title class="flex items-center gap-2 text-base">
				<ShieldCheck class="size-4 text-primary" />
				Set entitlement
			</Card.Title>
			<Card.Description>Manual override hook for support and billing incidents.</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-3">
			<label class="space-y-2 text-sm font-medium">
				<span>Organization</span>
				<select
					class="h-9 w-full rounded-md border bg-background px-2 text-sm"
					bind:value={targetOrgId}
				>
					<option value="">Select organization</option>
					{#each rows as row (row.organization._id)}
						<option value={row.organization._id}>{row.organization.name}</option>
					{/each}
				</select>
			</label>
			<label class="space-y-2 text-sm font-medium">
				<span>Key</span>
				<input
					class="h-9 w-full rounded-md border bg-background px-3 text-sm"
					bind:value={entitlementKey}
				/>
			</label>
			<label class="space-y-2 text-sm font-medium">
				<span>Limit</span>
				<input
					class="h-9 w-full rounded-md border bg-background px-3 text-sm"
					bind:value={entitlementLimit}
					placeholder="optional"
				/>
			</label>
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={entitlementEnabled} />
				Enabled
			</label>
			<Button class="w-full" onclick={saveEntitlement} disabled={!targetOrgId}
				>Save entitlement</Button
			>
			{#if message}
				<p class="text-sm text-primary">{message}</p>
			{/if}
			{#if error}
				<p class="text-sm text-destructive">{error}</p>
			{/if}
		</Card.Content>
	</Card.Root>
</main>
