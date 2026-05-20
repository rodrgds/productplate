<script lang="ts">
	import { authClient } from '$lib/auth-client.js';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { api } from '$convex/_generated/api.js';
	import { useQuery } from 'convex-svelte';

	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	const { data, children }: Props = $props();

	let hasClientSession = $state<boolean | null>(null);
	let isLoading = $derived(hasClientSession === null && !data.currentUser);
	let isAuthenticated = $derived(hasClientSession ?? Boolean(data.currentUser));
	const profileResponse = useQuery(api.userProfiles.getCurrent, {});
	let profile = $derived(profileResponse.data === undefined ? data.profile : profileResponse.data);
	let isProfileLoading = $derived(profileResponse.isLoading && profileResponse.data === undefined);
	let isOnboardingRoute = $derived(page.url.pathname === resolve('/onboarding'));

	onMount(async () => {
		const { data: session } = await authClient.getSession();
		hasClientSession = session !== null;
	});
</script>

{#if isLoading || (isAuthenticated && isProfileLoading)}
	<div class="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30">
		<div class="flex size-10 items-center justify-center rounded-lg border bg-background shadow-sm">
			<div
				class="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
			></div>
		</div>
		<p class="text-sm text-muted-foreground">Loading your workspace...</p>
	</div>
{:else if isAuthenticated}
	<Sidebar.Provider>
		{#if profile && !isOnboardingRoute}
			<AppSidebar />
		{/if}
		<Sidebar.Inset class={!profile || isOnboardingRoute ? 'w-full' : undefined}>
			{@render children()}
		</Sidebar.Inset>
	</Sidebar.Provider>
{/if}
