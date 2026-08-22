<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { resolveAppPath } from '$lib/utils.js';
	import { page } from '$app/state';
	import type { WithoutChildren } from '$lib/utils.js';
	import type { ComponentProps, Component } from 'svelte';
	import type { IconProps } from '@lucide/svelte';

	let {
		items,
		...restProps
	}: { items: { title: string; url: string; icon: Component<IconProps> }[] } & WithoutChildren<
		ComponentProps<typeof Sidebar.Group>
	> = $props();
	const sidebar = Sidebar.useSidebar();

	function closeMobileSidebar() {
		if (sidebar.isMobile) sidebar.setOpenMobile(false);
	}

	function isActive(url: string) {
		if (!url.startsWith('/')) return false;
		const href = resolveAppPath(url);
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}
</script>

<Sidebar.Group {...restProps}>
	<Sidebar.GroupContent>
		<Sidebar.Menu>
			{#each items as item (item.title)}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton isActive={isActive(item.url)}>
						{#snippet child({ props })}
							{#if item.url && item.url.startsWith('/')}
								<a
									href={resolveAppPath(item.url)}
									{...props}
									onclick={closeMobileSidebar}
									aria-current={isActive(item.url) ? 'page' : undefined}
								>
									<item.icon />
									<span>{item.title}</span>
								</a>
							{:else if item.url && (item.url.startsWith('https://') || item.url.startsWith('mailto:') || item.url.startsWith('tel:'))}
								<a
									href={item.url}
									target="_blank"
									rel="noopener noreferrer"
									{...props}
									onclick={closeMobileSidebar}
								>
									<item.icon />
									<span>{item.title}</span>
								</a>
							{:else}
								<span {...props}>
									<item.icon />
									<span>{item.title}</span>
								</span>
							{/if}
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
