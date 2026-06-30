<script lang="ts">
	import { APP_NAME } from '$lib/constants.js';
	import { api } from '$convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { Check, Code2, Copy, KeyRound, PlugZap } from '@lucide/svelte';
	import type { Id } from '$convex/_generated/dataModel.js';

	const convex = useConvexClient();
	const workspaceResponse = useQuery(api.organizations.getCurrent, {});

	let workspace = $derived(workspaceResponse.data);
	let apiKeyName = $state('Production key');
	let apiKeyScopes = $state('events:write');
	let webhookUrl = $state('https://example.com/api/webhooks/product');
	let webhookEvents = $state('template.event.created');
	let webhookDescription = $state('Product events');
	let revealedKey = $state('');
	let revealedSecret = $state('');
	let copied = $state('');
	let error = $state('');
	let message = $state('');
	let isBusy = $state(false);

	let sampleRequest = $derived(`curl -X POST "${
		typeof location === 'undefined' ? 'https://your-convex-site' : location.origin
	}/api/template-event" \\
  -H "Authorization: Bearer ${revealedKey || 'pp_live_...'}" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"signup.created","userId":"user_123"}'`);

	function splitList(value: string) {
		return value
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
	}

	async function copy(value: string, label: string) {
		await navigator.clipboard.writeText(value);
		copied = label;
		setTimeout(() => {
			if (copied === label) copied = '';
		}, 1600);
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
			'Workspace initialized.'
		);
	}

	async function createApiKey() {
		if (!workspace) return;
		await runAction(async () => {
			const result = await convex.mutation(api.developer.createApiKey, {
				orgId: workspace.organization._id,
				name: apiKeyName,
				scopes: splitList(apiKeyScopes)
			});
			revealedKey = result.key;
		}, 'API key created. Copy it now; it will not be shown again.');
	}

	async function revokeApiKey(apiKeyId: Id<'apiKeys'>) {
		await runAction(
			() =>
				convex.mutation(api.developer.revokeApiKey, {
					apiKeyId
				}),
			'API key revoked.'
		);
	}

	async function createWebhook() {
		if (!workspace) return;
		await runAction(async () => {
			const result = await convex.mutation(api.developer.createWebhookEndpoint, {
				orgId: workspace.organization._id,
				url: webhookUrl,
				description: webhookDescription,
				events: splitList(webhookEvents)
			});
			revealedSecret = result.secret;
		}, 'Webhook created. Copy the signing secret now.');
	}

	async function toggleWebhook(webhookId: Id<'webhookEndpoints'>, enabled: boolean) {
		await runAction(
			() =>
				convex.mutation(api.developer.toggleWebhookEndpoint, {
					webhookId,
					enabled
				}),
			enabled ? 'Webhook enabled.' : 'Webhook disabled.'
		);
	}
</script>

<svelte:head>
	<title>Developer | {APP_NAME}</title>
</svelte:head>

<header
	class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium">Developer</h1>
	</div>
</header>

<main class="flex flex-1 flex-col gap-4 p-4 lg:p-6">
	{#if !workspace}
		<Card.Root class="max-w-xl">
			<Card.Header>
				<Card.Title>Initialize developer settings</Card.Title>
				<Card.Description
					>Create the workspace record before issuing keys or webhooks.</Card.Description
				>
			</Card.Header>
			<Card.Content>
				<Button onclick={ensureWorkspace} disabled={isBusy}>Create workspace</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
			<div class="grid gap-4">
				<Card.Root>
					<Card.Header class="border-b">
						<Card.Title class="flex items-center gap-2 text-base">
							<KeyRound class="size-4 text-primary" />
							API keys
						</Card.Title>
						<Card.Description
							>Hashed storage, prefix lookup, scopes, last-used timestamps, and revocation.</Card.Description
						>
					</Card.Header>
					<Card.Content class="p-0">
						<div class="divide-y">
							{#each workspace.apiKeys as key (key._id)}
								<div class="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
									<div>
										<div class="flex flex-wrap items-center gap-2">
											<p class="font-medium">{key.name}</p>
											<Badge variant={key.revokedAt ? 'secondary' : 'default'}>
												{key.revokedAt ? 'Revoked' : 'Active'}
											</Badge>
										</div>
										<p class="text-sm text-muted-foreground">
											{key.prefix}... · {key.scopes.join(', ')}
										</p>
									</div>
									<p class="text-sm text-muted-foreground">
										{key.lastUsedAt
											? `Used ${new Date(key.lastUsedAt).toLocaleDateString()}`
											: 'Never used'}
									</p>
									<Button
										variant="outline"
										size="sm"
										disabled={Boolean(key.revokedAt) || isBusy}
										onclick={() => revokeApiKey(key._id)}
									>
										Revoke
									</Button>
								</div>
							{:else}
								<p class="p-4 text-sm text-muted-foreground">No API keys yet.</p>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="border-b">
						<Card.Title class="flex items-center gap-2 text-base">
							<PlugZap class="size-4 text-primary" />
							Webhooks
						</Card.Title>
						<Card.Description
							>Endpoint registry with signing secrets and event filters.</Card.Description
						>
					</Card.Header>
					<Card.Content class="p-0">
						<div class="divide-y">
							{#each workspace.webhooks as webhook (webhook._id)}
								<div class="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
									<div>
										<div class="flex flex-wrap items-center gap-2">
											<p class="font-medium">{webhook.description}</p>
											<Badge variant={webhook.enabled ? 'default' : 'secondary'}>
												{webhook.enabled ? 'Enabled' : 'Disabled'}
											</Badge>
										</div>
										<p class="text-sm break-all text-muted-foreground">{webhook.url}</p>
										<p class="text-xs text-muted-foreground">{webhook.events.join(', ')}</p>
									</div>
									<Button
										variant="outline"
										size="sm"
										onclick={() => toggleWebhook(webhook._id, !webhook.enabled)}
									>
										{webhook.enabled ? 'Disable' : 'Enable'}
									</Button>
								</div>
							{:else}
								<p class="p-4 text-sm text-muted-foreground">No webhooks yet.</p>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<div class="grid gap-4 self-start">
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Create API key</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-3">
						<input
							class="h-9 w-full rounded-md border bg-background px-3 text-sm"
							bind:value={apiKeyName}
						/>
						<input
							class="h-9 w-full rounded-md border bg-background px-3 text-sm"
							bind:value={apiKeyScopes}
						/>
						<Button class="w-full" onclick={createApiKey} disabled={isBusy}>Create key</Button>
						{#if revealedKey}
							<div class="rounded-lg border bg-muted p-3 text-sm">
								<p class="mb-2 font-medium">Copy now</p>
								<div class="flex min-w-0 gap-2">
									<code class="min-w-0 flex-1 truncate">{revealedKey}</code>
									<Button variant="ghost" size="icon" onclick={() => copy(revealedKey, 'key')}>
										{#if copied === 'key'}<Check />{:else}<Copy />{/if}
									</Button>
								</div>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Create webhook</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-3">
						<input
							class="h-9 w-full rounded-md border bg-background px-3 text-sm"
							bind:value={webhookDescription}
						/>
						<input
							class="h-9 w-full rounded-md border bg-background px-3 text-sm"
							bind:value={webhookUrl}
						/>
						<input
							class="h-9 w-full rounded-md border bg-background px-3 text-sm"
							bind:value={webhookEvents}
						/>
						<Button class="w-full" onclick={createWebhook} disabled={isBusy}>Create webhook</Button>
						{#if revealedSecret}
							<div class="rounded-lg border bg-muted p-3 text-sm">
								<p class="mb-2 font-medium">Signing secret</p>
								<div class="flex min-w-0 gap-2">
									<code class="min-w-0 flex-1 truncate">{revealedSecret}</code>
									<Button
										variant="ghost"
										size="icon"
										onclick={() => copy(revealedSecret, 'secret')}
									>
										{#if copied === 'secret'}<Check />{:else}<Copy />{/if}
									</Button>
								</div>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header class="border-b">
						<Card.Title class="flex items-center gap-2 text-base">
							<Code2 class="size-4 text-primary" />
							Template endpoint
						</Card.Title>
					</Card.Header>
					<Card.Content class="p-0">
						<div class="relative">
							<Button
								class="absolute top-3 right-3"
								variant="secondary"
								size="sm"
								onclick={() => copy(sampleRequest, 'curl')}
							>
								{#if copied === 'curl'}<Check />{:else}<Copy />{/if}
							</Button>
							<pre class="overflow-auto p-4 pr-16 text-xs leading-5"><code>{sampleRequest}</code
								></pre>
						</div>
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
