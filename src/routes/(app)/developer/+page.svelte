<script lang="ts">
	import { APP_NAME } from '$lib/constants.js';
	import { api } from '$convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { Check, Code2, Copy, KeyRound } from '@lucide/svelte';
	import type { Id } from '$convex/_generated/dataModel.js';
	import { toast } from 'svelte-sonner';
	import { soundPreferences } from '$lib/sound-preferences.svelte.js';

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
	let copied = $state('');
	let error = $state('');
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
		try {
			await navigator.clipboard.writeText(value);
			copied = label;
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
		isBusy = true;
		error = '';
		try {
			await action();
			toast.success(success);
			soundPreferences.play('success');
		} catch (cause) {
			error = cause instanceof Error ? cause.message : String(cause);
			toast.error(error);
			soundPreferences.play('error');
		} finally {
			isBusy = false;
		}
	}

	async function ensureWorkspace() {
		if (!clientCurrentUser) {
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

	async function revokeApiKey(apiKeyId: Id<'apiKeys'>) {
		await runAction(
			() =>
				convex.mutation(api.developer.revokeApiKey, {
					apiKeyId
				}),
			'API key revoked.'
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

<main class="flex min-w-0 flex-1 flex-col gap-4 bg-muted/20 p-4 lg:p-6">
	{#if workspaceSummaryResponse.isLoading}
		<Card.Root class="max-w-xl gap-0 py-0">
			<Card.Content class="p-4 text-sm text-muted-foreground"
				>Loading developer settings...</Card.Content
			>
		</Card.Root>
	{:else if !workspaceSummary}
		<Card.Root class="max-w-xl gap-0 py-0">
			<Card.Header class="p-4 pb-3">
				<Card.Title>Initialize developer settings</Card.Title>
				<Card.Description>Create the workspace record before issuing API keys.</Card.Description>
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
										onclick={() => revokeApiKey(key._id)}
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

	{#if error}
		<p class="text-sm text-destructive">{error}</p>
	{/if}
</main>
