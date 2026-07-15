<script lang="ts">
	import { resolve } from '$app/paths';
	import { api } from '$convex/_generated/api.js';
	import { useQuery } from 'convex-svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import {
		Settings,
		Users,
		CreditCard,
		LayoutDashboard,
		MessageSquareText,
		PenLine,
		GitBranch,
		Cuboid,
		MapPinned,
		CircleQuestionMark,
		ChartLine,
		Building2,
		Code2
	} from '@lucide/svelte';
	import NavMain from './nav-main.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import NavAdmin from './nav-admin.svelte';
	import NavUser from './nav-user.svelte';
	import TeamSwitcher from './team-switcher.svelte';
	import type { ComponentProps } from 'svelte';
	import { APP_NAME } from '$lib/constants.js';
	import AppLogo from '$lib/components/app-logo.svelte';
	import type { Doc } from '$convex/_generated/dataModel.js';

	interface WorkspaceOptionSource {
		organization: Doc<'organizations'>;
	}

	const currentUserResponse = useQuery(api.auth.getCurrentUser, {});
	const workspacesResponse = useQuery(api.organizations.listCurrent, {});
	const currentWorkspaceResponse = useQuery(api.organizations.getCurrent, {});
	let user = $derived(currentUserResponse.data);
	let workspaceOptions = $derived(
		(workspacesResponse.data ?? []).map((workspace: WorkspaceOptionSource) => ({
			id: workspace.organization._id,
			name: workspace.organization.name,
			plan: workspace.organization.planKey
		}))
	);

	const userData = $derived({
		name: user?.name ?? 'User',
		email: user?.email ?? '',
		avatar: user?.image ?? ''
	});

	const isAdmin = $derived(user?.role === 'admin');

	const navMainData = [
		{
			title: 'Dashboard',
			url: '/dashboard',
			icon: LayoutDashboard
		},
		{
			title: 'Billing',
			url: '/billing',
			icon: CreditCard
		},
		{
			title: 'Workspace',
			url: '/workspace',
			icon: Building2
		},
		{
			title: 'Developer',
			url: '/developer',
			icon: Code2
		},
		{
			title: 'Assistant',
			url: '/assistant',
			icon: MessageSquareText
		},
		{
			title: 'Editor',
			url: '/editor',
			icon: PenLine
		},
		{
			title: 'Flow',
			url: '/flow',
			icon: GitBranch
		},
		{
			title: 'Map',
			url: '/map',
			icon: MapPinned
		},
		{
			title: 'Threlte',
			url: '/threlte',
			icon: Cuboid
		}
	];

	const data = $derived.by(() => ({
		user: userData,
		navMain: navMainData,
		navSecondary: [
			{
				title: 'Settings',
				url: '/settings',
				icon: Settings
			},
			{
				title: 'Get Help',
				url: '#',
				icon: CircleQuestionMark
			}
		],
		admin: [
			{
				name: 'Users',
				url: '/admin/users',
				icon: Users
			},
			{
				name: 'Organizations',
				url: '/admin/organizations',
				icon: Building2
			},
			{
				name: 'Analytics',
				url: '#',
				icon: ChartLine
			}
		]
	}));

	let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root collapsible="icon" {...restProps}>
	<Sidebar.Header>
		{#if workspaceOptions.length > 0}
			<TeamSwitcher
				teams={workspaceOptions}
				activeId={currentWorkspaceResponse.data?.organization._id}
			/>
		{:else}
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
						{#snippet child({ props })}
							<a href={resolve('/')} {...props}>
								<AppLogo class="!size-5" />
								<span class="text-base font-semibold">{APP_NAME}</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		{/if}
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		{#if isAdmin}
			<NavAdmin items={data.admin} />
		{/if}
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
</Sidebar.Root>
