<script lang="ts">
	import { resolve } from '$app/paths';
	import { api } from '$convex/_generated/api.js';
	import { APP_NAME } from '$lib/constants.js';
	import { isDemoAccountEmail } from '$lib/demo-account.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import {
		ArrowUpRight,
		Bot,
		Building2,
		CheckCircle2,
		CircleDashed,
		Code2,
		CreditCard,
		Cuboid,
		GitBranch,
		MapPinned,
		PenLine,
		UserRound
	} from '@lucide/svelte';
	import type { IconProps } from '@lucide/svelte';
	import { useQuery } from 'convex-svelte';
	import type { Component } from 'svelte';

	interface WorkbenchLink {
		title: string;
		description: string;
		href: string;
		icon: Component<IconProps>;
		hideForDemo?: boolean;
	}

	const currentUserResponse = useQuery(api.auth.getCurrentUser, {});
	const profileResponse = useQuery(api.userProfiles.getCurrent, {});
	const workspaceResponse = useQuery(api.organizations.getCurrent, {});

	let user = $derived(currentUserResponse.data);
	let profile = $derived(profileResponse.data);
	let workspace = $derived(workspaceResponse.data);
	let isLoading = $derived(
		currentUserResponse.isLoading || profileResponse.isLoading || workspaceResponse.isLoading
	);
	let isDemo = $derived(isDemoAccountEmail(user?.email));
	let displayName = $derived(profile?.displayName || user?.name || 'there');

	const workbenchLinks = [
		{
			title: 'Workspace',
			description: 'Manage members, roles, invites, and notifications.',
			href: '/workspace',
			icon: Building2
		},
		{
			title: 'Developer',
			description: 'Issue scoped API keys and inspect the request contract.',
			href: '/developer',
			icon: Code2,
			hideForDemo: true
		},
		{
			title: 'Billing',
			description: 'Review plans, entitlements, checkout, and the customer portal.',
			href: '/billing',
			icon: CreditCard,
			hideForDemo: true
		},
		{
			title: 'Assistant',
			description: 'Try the streaming AI route and its calculator tool.',
			href: '/assistant',
			icon: Bot
		},
		{
			title: 'Editor',
			description: 'Inspect the ProseKit rich-text starter surface.',
			href: '/editor',
			icon: PenLine
		},
		{
			title: 'Flow',
			description: 'Explore the Svelte Flow canvas integration.',
			href: '/flow',
			icon: GitBranch
		},
		{
			title: 'Map',
			description: 'Open the themed MapLibre route and controls.',
			href: '/map',
			icon: MapPinned
		},
		{
			title: 'Threlte',
			description: 'Review the interactive 3D starter scene.',
			href: '/threlte',
			icon: Cuboid
		}
	] satisfies readonly WorkbenchLink[];

	let availableLinks = $derived(workbenchLinks.filter((link) => !(isDemo && link.hideForDemo)));
</script>

<svelte:head>
	<title>Dashboard | {APP_NAME}</title>
</svelte:head>

<header class="flex h-16 shrink-0 items-center gap-2 border-b">
	<div class="flex w-full min-w-0 items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium">Dashboard</h1>
		<span class="ml-auto hidden max-w-56 truncate text-sm text-muted-foreground sm:block">
			{user?.email ?? 'Connecting account...'}
		</span>
	</div>
</header>

<div class="flex flex-1 flex-col bg-muted/20 p-4 lg:p-6">
	<div
		class="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)]"
	>
		<section
			class="min-w-0 overflow-hidden rounded-xl border bg-card"
			aria-labelledby="workbench-heading"
		>
			<div class="border-b p-5 sm:p-6">
				<div class="flex flex-wrap items-center gap-2">
					<Badge variant="outline">Product workbench</Badge>
					{#if isDemo}<Badge variant="secondary">Disposable demo</Badge>{/if}
				</div>
				<h2 id="workbench-heading" class="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
					Welcome, {displayName}
				</h2>
				<p class="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
					Every surface reads from the live account and workspace beside it. Open one to inspect the
					implementation, then keep, replace, or remove it for your product.
				</p>
			</div>

			<nav aria-label="Product workbench" class="divide-y">
				{#each availableLinks as item (item.href)}
					<a
						href={resolve(item.href as '/')}
						class="group flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset sm:px-6"
					>
						<span
							class="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors group-hover:text-foreground group-focus-visible:text-foreground"
						>
							<item.icon class="size-4" />
						</span>
						<span class="min-w-0 flex-1">
							<span class="block text-sm font-medium">{item.title}</span>
							<span class="mt-0.5 block text-sm leading-5 text-muted-foreground">
								{item.description}
							</span>
						</span>
						<ArrowUpRight
							class="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5"
						/>
					</a>
				{/each}
			</nav>
		</section>

		<aside
			class="self-start overflow-hidden rounded-xl border bg-card"
			aria-labelledby="setup-heading"
		>
			<div class="border-b p-5">
				<div class="flex items-center gap-2">
					<UserRound class="size-4 text-primary" />
					<h2 id="setup-heading" class="font-semibold">Live setup</h2>
				</div>
				<p class="mt-1 text-sm text-muted-foreground">
					Current Convex identity and workspace state.
				</p>
			</div>

			<div aria-live="polite" aria-busy={isLoading} class="divide-y">
				<div class="flex gap-3 p-4">
					{#if currentUserResponse.isLoading}
						<CircleDashed class="mt-0.5 size-4 shrink-0 animate-spin text-muted-foreground" />
					{:else}
						<CheckCircle2 class="mt-0.5 size-4 shrink-0 text-primary" />
					{/if}
					<div class="min-w-0">
						<p class="text-sm font-medium">Account</p>
						<p class="mt-0.5 text-sm break-all text-muted-foreground">
							{currentUserResponse.isLoading ? 'Connecting...' : (user?.email ?? 'Unavailable')}
						</p>
					</div>
				</div>

				<div class="flex gap-3 p-4">
					{#if profileResponse.isLoading}
						<CircleDashed class="mt-0.5 size-4 shrink-0 animate-spin text-muted-foreground" />
					{:else if profile}
						<CheckCircle2 class="mt-0.5 size-4 shrink-0 text-primary" />
					{:else}
						<CircleDashed class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
					{/if}
					<div class="min-w-0">
						<p class="text-sm font-medium">Profile</p>
						<p class="mt-0.5 text-sm text-muted-foreground">
							{profileResponse.isLoading
								? 'Loading...'
								: profile
									? `${profile.displayName} · ${profile.role}`
									: 'Setup required'}
						</p>
					</div>
				</div>

				<div class="flex gap-3 p-4">
					{#if workspaceResponse.isLoading}
						<CircleDashed class="mt-0.5 size-4 shrink-0 animate-spin text-muted-foreground" />
					{:else if workspace}
						<CheckCircle2 class="mt-0.5 size-4 shrink-0 text-primary" />
					{:else}
						<CircleDashed class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
					{/if}
					<div class="min-w-0">
						<p class="text-sm font-medium">Workspace</p>
						<p class="mt-0.5 text-sm text-muted-foreground">
							{workspaceResponse.isLoading
								? 'Loading...'
								: workspace
									? `${workspace.organization.name} · ${workspace.membership.role}`
									: 'Not created'}
						</p>
					</div>
				</div>
			</div>

			<div class="flex flex-col gap-2 border-t p-4 sm:flex-row lg:flex-col xl:flex-row">
				<Button href={resolve('/workspace')} class="flex-1">Open workspace</Button>
				<Button href={resolve('/settings')} variant="outline" class="flex-1">Edit profile</Button>
			</div>
		</aside>
	</div>
</div>
