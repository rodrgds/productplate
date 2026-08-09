<script lang="ts">
	import type { Component } from 'svelte';
	import type { IconProps } from '@lucide/svelte';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let { items }: { items: { name: string; url: string; icon: Component<IconProps> }[] } = $props();
	const sidebar = Sidebar.useSidebar();

	function closeMobileSidebar() {
		if (sidebar.isMobile) sidebar.setOpenMobile(false);
	}

	function isActive(url: string) {
		if (!url.startsWith('/')) return false;
		const href = resolve(url as '/');
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
	<Sidebar.GroupLabel>Admin</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each items as item (item.name)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton isActive={isActive(item.url)}>
					{#snippet child({ props })}
						{#if item.url && item.url.startsWith('/')}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a
								{...props}
								href={resolve(item.url as '/')}
								onclick={closeMobileSidebar}
								aria-current={isActive(item.url) ? 'page' : undefined}
							>
								<item.icon />
								<span>{item.name}</span>
							</a>
						{:else if item.url && (item.url.startsWith('https://') || item.url.startsWith('mailto:') || item.url.startsWith('tel:'))}
							<!-- eslint-disable svelte/no-navigation-without-resolve -->
							<a
								{...props}
								href={item.url}
								target="_blank"
								rel="noopener noreferrer"
								onclick={closeMobileSidebar}
							>
								<item.icon />
								<span>{item.name}</span>
							</a>
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
						{:else}
							<span {...props}>
								<item.icon />
								<span>{item.name}</span>
							</span>
						{/if}
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
