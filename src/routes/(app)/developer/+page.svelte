<script lang="ts">
	import { APP_NAME } from '$lib/constants.js';
	import { api } from '$convex/_generated/api.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { Check, Code2, Copy, KeyRound } from '@lucide/svelte';
	import type { Id } from '$convex/_generated/dataModel.js';
	import { toast } from 'svelte-sonner';
	import { soundPreferences } from '$lib/sound-preferences.svelte.js';

	interface PendingRevocation {
		id: Id<'apiKeys'>;
		name: string;
	}

	const convex = useConvexClient();
	const currentUserResponse = useQuery(api.auth.getCurrentUser, {});
	const workspaceSummaryResponse = useQuery(api.organizations.getCurrent, {});
	const developerSettingsResponse = useQuery(api.developer.getCurrentSettings, {});

	let clientCurrentUser = $derived(currentUserResponse.data);
	let workspaceSummary = $derived(workspaceSummaryResponse.data);
	let workspace = $derived(developerSettingsResponse.data);
	let apiKeyName = $state('Production key');
	let apiKeyScopes = $state('events:write');
	let revealedKey = $state('');
	let copied = $state<'key' | 'curl' | ''>('');
	let error = $state('');
	let message = $state('');
	let isBusy = $state(false);
	let pendingRevocation = $state<PendingRevocation | null>(null);
	let showRevokeDialog = $state(false);

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

	async function copy(value: string, label: 'key' | 'curl') {
		error = '';
		message = '';
		try {
			await navigator.clipboard.writeText(value);
			copied = label;
			message = label === 'key' ? 'API key copied.' : 'Sample request copied.';
			soundPreferences.play('success');
			setTimeout(() => {
				if (copied === label) copied = '';
			}, 1600);
		} catch (cause) {
			error = cause instanceof Error ? cause.message : 'Unable to copy to the clipboard.';
			toast.error(error);
			soundPreferences.play('error');
		}
	}

	async function runAction(action: () => Promise<unknown>, success: string) {
		if (isBusy) return false;

		isBusy = true;
		error = '';
		message = '';
		try {
			await action();
			message = success;
			toast.success(success);
			soundPreferences.play('success');
			return true;
		} catch (cause) {
			error =
				cause instanceof Error && cause.message.trim()
					? cause.message
					: 'The action could not be completed. Try again.';
			toast.error(error);
			soundPreferences.play('error');
			return false;
		} finally {
			isBusy = false;
		}
	}

	async function ensureWorkspace() {
		if (!clientCurrentUser) {
			message = '';
			error = currentUserResponse.isLoading
				? 'Your session is still connecting. Try again in a moment.'
				: 'Sign in again before creating developer resources.';
			return;
		}

		await runAction(
			() => convex.mutation(api.organizations.ensureCurrent, {}),
			'Workspace initialized.'
		);
	}

	async function createApiKey() {
		if (!workspace) return;
		await runAction(async () => {
			const result = await convex.mutation(api.developer.createApiKey, {
				orgId: workspace.orgId,
				name: apiKeyName,
				scopes: splitList(apiKeyScopes)
			});
			revealedKey = result.key;
		}, 'API key created. Copy it now; it will not be shown again.');
	}

	function requestApiKeyRevocation(id: Id<'apiKeys'>, name: string) {
		error = '';
		message = '';
		pendingRevocation = { id, name };
		showRevokeDialog = true;
	}

	function cancelApiKeyRevocation() {
		showRevokeDialog = false;
		pendingRevocation = null;
	}

	async function confirmApiKeyRevocation() {
		if (!pendingRevocation) return;

		const apiKeyId = pendingRevocation.id;
		const revoked = await runAction(
			() =>
				convex.mutation(api.developer.revokeApiKey, {
					apiKeyId
				}),
			'API key revoked.'
		);

		if (!revoked) return;
		showRevokeDialog = false;
		pendingRevocation = null;
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

<div class="flex min-w-0 flex-1 flex-col gap-4 bg-muted/20 p-4 lg:p-6">
	{#if workspaceSummaryResponse.isLoading}
		<Card.Root class="max-w-xl gap-0 py-0">
			<Card.Content class="p-4 text-sm text-muted-foreground"
				>Loading developer settings...</Card.Content
			>
		</Card.Root>
	{:else if !workspaceSummary}
		<Card.Root class="max-w-xl gap-0 py-0">
			<Card.Header class="p-4 pb-3">
				<Card.Title>Create developer settings</Card.Title>
				<Card.Description>Create a workspace before issuing API keys.</Card.Description>
			</Card.Header>
			<Card.Content class="p-4 pt-0">
				<Button onclick={ensureWorkspace} disabled={isBusy || !clientCurrentUser}>
					{currentUserResponse.isLoading ? 'Preparing session...' : 'Create workspace'}
				</Button>
			</Card.Content>
		</Card.Root>
	{:else if !workspace}
		<Card.Root class="max-w-xl gap-0 py-0">
			<Card.Header class="p-4">
				<Card.Title>Developer settings unavailable</Card.Title>
				<Card.Description>
					Your {workspaceSummary.membership.role} role does not include API key administration.
				</Card.Description>
			</Card.Header>
		</Card.Root>
	{:else}
		<div class="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
			<div class="grid min-w-0 auto-rows-max content-start gap-4">
				<Card.Root class="min-w-0 gap-0 overflow-hidden py-0">
					<Card.Header class="border-b p-4">
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
								<div
									class="grid min-w-0 gap-3 p-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center"
								>
									<div class="min-w-0">
										<div class="flex flex-wrap items-center gap-2">
											<p class="font-medium">{key.name}</p>
											<Badge variant={key.revokedAt ? 'secondary' : 'default'}>
												{key.revokedAt ? 'Revoked' : 'Active'}
											</Badge>
										</div>
										<p class="text-sm break-all text-muted-foreground">
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
										onclick={() => requestApiKeyRevocation(key._id, key.name)}
										aria-label={`Revoke ${key.name}`}
									>
										Revoke
									</Button>
								</div>
							{:else}
								<div class="p-4">
									<p class="text-sm font-medium">No API keys yet</p>
									<p class="mt-1 text-sm text-muted-foreground">
										Create one from the panel on the right when you need API access.
									</p>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<div class="grid min-w-0 auto-rows-max content-start gap-4 self-start">
				<Card.Root class="min-w-0 gap-0 overflow-hidden py-0">
					<Card.Header class="p-4 pb-3">
						<Card.Title class="text-base">Create API key</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-3 p-4 pt-0">
						<div class="space-y-2">
							<Label for="api-key-name">Key name</Label>
							<Input id="api-key-name" bind:value={apiKeyName} autocomplete="off" />
						</div>
						<div class="space-y-2">
							<Label for="api-key-scopes">Scopes</Label>
							<Input
								id="api-key-scopes"
								bind:value={apiKeyScopes}
								autocomplete="off"
								spellcheck={false}
								aria-describedby="api-key-scopes-description"
							/>
							<p id="api-key-scopes-description" class="text-xs text-muted-foreground">
								Separate scopes with commas, for example events:write.
							</p>
						</div>
						<Button
							class="w-full"
							onclick={createApiKey}
							disabled={isBusy || !apiKeyName.trim() || splitList(apiKeyScopes).length === 0}
						>
							{isBusy ? 'Creating...' : 'Create key'}
						</Button>
						{#if revealedKey}
							<div class="rounded-lg border bg-muted p-3 text-sm">
								<p class="mb-2 font-medium">Copy now</p>
								<div class="flex min-w-0 gap-2">
									<code class="min-w-0 flex-1 truncate">{revealedKey}</code>
									<Button
										variant="ghost"
										size="icon"
										onclick={() => copy(revealedKey, 'key')}
										aria-label={copied === 'key' ? 'API key copied' : 'Copy API key'}
										title={copied === 'key' ? 'API key copied' : 'Copy API key'}
									>
										{#if copied === 'key'}<Check />{:else}<Copy />{/if}
									</Button>
								</div>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
				<Card.Root class="min-w-0 gap-0 overflow-hidden py-0">
					<Card.Header class="border-b p-4">
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
								aria-label={copied === 'curl' ? 'Sample request copied' : 'Copy sample request'}
								title={copied === 'curl' ? 'Sample request copied' : 'Copy sample request'}
							>
								{#if copied === 'curl'}<Check />{:else}<Copy />{/if}
							</Button>
							<pre
								class="max-w-full overflow-auto p-4 pr-16 text-xs leading-5 break-all whitespace-pre-wrap"><code
									>{sampleRequest}</code
								></pre>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{/if}

	{#if message}
		<p class="rounded-md border border-primary/20 bg-primary/5 p-3 text-sm" role="status">
			{message}
		</p>
	{/if}
	{#if error && !showRevokeDialog}
		<p
			class="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
			role="alert"
		>
			{error}
		</p>
	{/if}
</div>

<AlertDialog.Root bind:open={showRevokeDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Revoke {pendingRevocation?.name ?? 'this API key'}?</AlertDialog.Title>
			<AlertDialog.Description>
				This cannot be undone. Requests that use this key will stop working immediately.
			</AlertDialog.Description>
		</AlertDialog.Header>
		{#if error}
			<p class="text-sm text-destructive" role="alert">{error}</p>
		{/if}
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={cancelApiKeyRevocation} disabled={isBusy}>
				Cancel
			</AlertDialog.Cancel>
			<Button variant="destructive" onclick={confirmApiKeyRevocation} disabled={isBusy}>
				{isBusy ? 'Revoking...' : error ? 'Retry revocation' : 'Revoke key'}
			</Button>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
