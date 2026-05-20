<script lang="ts">
	import type { Component } from 'svelte';
	import type { IconProps } from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { resolve } from '$app/paths';

	let { items }: { items: { title: string; url: string; icon?: Component<IconProps> }[] } =
		$props();
</script>

<Sidebar.Group>
	<Sidebar.GroupContent class="flex flex-col gap-2">
		<Sidebar.Menu>
			{#each items as item (item.title)}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton tooltipContent={item.title}>
						{#snippet child({ props })}
							{#if item.url && item.url.startsWith('/')}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a href={resolve(item.url as '/')} {...props}>
									{#if item.icon}
										<item.icon />
									{/if}
									<span>{item.title}</span>
								</a>
							{:else if item.url && (item.url.startsWith('https://') || item.url.startsWith('mailto:') || item.url.startsWith('tel:'))}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a href={item.url} target="_blank" rel="noopener noreferrer" {...props}>
									{#if item.icon}
										<item.icon />
									{/if}
									<span>{item.title}</span>
								</a>
							{:else}
								<span {...props}>
									{#if item.icon}
										<item.icon />
									{/if}
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
