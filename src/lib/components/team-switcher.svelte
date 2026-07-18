<script lang="ts">
	import { api } from '$convex/_generated/api.js';
	import type { Id } from '$convex/_generated/dataModel.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import Building2Icon from '@lucide/svelte/icons/building-2';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { useConvexClient } from 'convex-svelte';
	import { toast } from 'svelte-sonner';

	interface WorkspaceOption {
		id: Id<'organizations'>;
		name: string;
		plan: string;
	}

	let {
		teams,
		activeId
	}: {
		teams: WorkspaceOption[];
		activeId?: Id<'organizations'>;
	} = $props();
	const sidebar = useSidebar();
	const convex = useConvexClient();
	let isSwitching = $state(false);
	let activeTeam = $derived(teams.find((team) => team.id === activeId) ?? teams[0]);

	async function selectWorkspace(team: WorkspaceOption) {
		if (team.id === activeId || isSwitching) return;
		isSwitching = true;
		try {
			await convex.mutation(api.organizations.setCurrent, { orgId: team.id });
			sidebar.setOpenMobile(false);
			toast.success(`Switched to ${team.name}.`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Unable to switch workspace.');
		} finally {
			isSwitching = false;
		}
	}
</script>

{#if activeTeam}
	<Sidebar.Menu>
		<Sidebar.MenuItem>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton
							{...props}
							size="lg"
							aria-disabled={isSwitching}
							class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div
								class="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
							>
								<Building2Icon />
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-medium">{activeTeam.name}</span>
								<span class="truncate text-xs capitalize">{activeTeam.plan}</span>
							</div>
							{#if teams.length > 1}<ChevronsUpDownIcon class="ml-auto" />{/if}
						</Sidebar.MenuButton>
					{/snippet}
				</DropdownMenu.Trigger>
				{#if teams.length > 1}
					<DropdownMenu.Content
						class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
						portalProps={sidebar.isMobile ? { to: '[data-mobile="true"]' } : undefined}
						align="start"
						side={sidebar.isMobile ? 'bottom' : 'right'}
						sideOffset={4}
					>
						<DropdownMenu.Label class="text-xs text-muted-foreground">Workspaces</DropdownMenu.Label
						>
						<DropdownMenu.Group>
							{#each teams as team (team.id)}
								<DropdownMenu.Item onSelect={() => selectWorkspace(team)} class="gap-2 p-2">
									<div class="flex size-6 items-center justify-center rounded-md border">
										<Building2Icon />
									</div>
									<span class="min-w-0 flex-1 truncate">{team.name}</span>
									{#if team.id === activeId}<CheckIcon />{/if}
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				{/if}
			</DropdownMenu.Root>
		</Sidebar.MenuItem>
	</Sidebar.Menu>
{/if}
