<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import CommandIcon from '@lucide/svelte/icons/command';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	interface HeroAction {
		label: string;
		href: string;
		variant?: 'default' | 'outline' | 'secondary' | 'ghost';
	}

	interface Activity {
		label: string;
		owner: string;
		status: string;
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		actions?: readonly HeroAction[];
		customerLogos?: readonly string[];
		activities?: readonly Activity[];
	}

	let {
		kicker = 'The operating layer for small teams',
		title = 'Run the work, not the busywork.',
		description = 'Bring customer requests, recurring work, and team decisions into one calm workspace that keeps itself current.',
		actions = [
			{ label: 'Start free', href: '/auth/sign-up' },
			{ label: 'See how it works', href: '#workflow', variant: 'outline' }
		],
		customerLogos = ['Northstar', 'Plainview', 'Lattice', 'Monument'],
		activities = [
			{ label: 'Prepare weekly customer brief', owner: 'Product', status: 'Ready' },
			{ label: 'Route onboarding feedback', owner: 'Success', status: 'Running' },
			{ label: 'Update launch dependencies', owner: 'Growth', status: 'Review' }
		]
	}: Props = $props();

	const bars = [32, 46, 41, 63, 54, 78, 72, 88, 81, 96] as const;
</script>

<section class="relative overflow-hidden border-b bg-background">
	<div class="hero-grid pointer-events-none absolute inset-0" aria-hidden="true"></div>
	<div
		class="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 sm:py-24 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:py-28"
	>
		<div>
			<Badge variant="outline">
				<SparklesIcon />
				{kicker}
			</Badge>
			<h1
				class="mt-7 max-w-3xl text-5xl leading-[0.96] font-semibold tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl"
			>
				{title}
			</h1>
			<p class="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">{description}</p>
			<div class="mt-9 flex flex-wrap gap-3">
				{#each actions as action (action.label)}
					<Button href={action.href} variant={action.variant ?? 'default'} size="lg">
						{action.label}
						{#if !action.variant || action.variant === 'default'}
							<ArrowRightIcon data-icon="inline-end" />
						{/if}
					</Button>
				{/each}
			</div>

			<div class="mt-12 border-t pt-6">
				<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					Trusted by focused teams at
				</p>
				<div class="mt-4 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-foreground/65">
					{#each customerLogos as logo (logo)}
						<span>{logo}</span>
					{/each}
				</div>
			</div>
		</div>

		<div class="dashboard-shell">
			<div class="dashboard-topbar">
				<div class="flex items-center gap-2">
					<span
						class="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground"
					>
						<CommandIcon class="size-3.5" />
					</span>
					<span class="text-sm font-semibold">Operations</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="hidden text-xs text-muted-foreground sm:inline">Updated just now</span>
					<span class="size-7 rounded-full border bg-muted"></span>
				</div>
			</div>

			<div class="dashboard-body">
				<aside class="hidden border-r p-3 sm:block">
					<p class="px-2 py-1 text-xs font-medium text-muted-foreground">Workspace</p>
					{#each ['Overview', 'Workflows', 'Customers', 'Reports'] as item, index (item)}
						<div
							class="mt-1 rounded-md px-2 py-2 text-xs font-medium"
							class:bg-muted={index === 0}
							class:text-muted-foreground={index !== 0}
						>
							{item}
						</div>
					{/each}
				</aside>

				<div class="min-w-0 p-4 sm:p-5">
					<div class="flex items-start justify-between gap-4">
						<div>
							<p class="text-xs text-muted-foreground">Tuesday, 16 July</p>
							<h2 class="mt-1 text-lg font-semibold tracking-tight">Good morning, Maya</h2>
						</div>
						<Badge variant="secondary">4 on track</Badge>
					</div>

					<div class="mt-5 grid gap-3 lg:grid-cols-[1.12fr_0.88fr]">
						<div class="rounded-xl border bg-card p-4">
							<div class="flex items-center justify-between gap-3">
								<div>
									<p class="text-xs font-medium text-muted-foreground">Completed work</p>
									<p class="mt-1 text-sm font-semibold">A steadier week</p>
								</div>
								<span class="text-xs font-semibold text-primary">+18%</span>
							</div>
							<div class="mt-6 flex h-28 items-end gap-1.5" aria-hidden="true">
								{#each bars as value, index (index)}
									<span
										class="min-w-1 flex-1 rounded-t-sm bg-primary/25 last:bg-primary"
										style={`height: ${value}%`}
									></span>
								{/each}
							</div>
						</div>

						<div class="rounded-xl border bg-muted/35 p-4">
							<p class="text-xs font-medium text-muted-foreground">Next best action</p>
							<p class="mt-3 text-sm leading-6 font-medium">
								Review three accounts with a renewal risk this week.
							</p>
							<div class="mt-5 flex items-center gap-2 text-xs font-medium text-primary">
								<span
									class="grid size-5 place-items-center rounded-full bg-primary text-primary-foreground"
								>
									<CheckIcon class="size-3" />
								</span>
								Brief prepared automatically
							</div>
						</div>
					</div>

					<div class="mt-3 overflow-hidden rounded-xl border bg-card">
						<div class="flex items-center justify-between border-b px-4 py-3">
							<p class="text-sm font-semibold">Active workflows</p>
							<span class="text-xs text-muted-foreground">Owner</span>
						</div>
						{#each activities as activity (activity.label)}
							<div class="activity-row">
								<span class="size-1.5 rounded-full bg-primary"></span>
								<span class="min-w-0 flex-1 truncate text-xs font-medium">{activity.label}</span>
								<span class="hidden text-xs text-muted-foreground sm:inline">{activity.owner}</span>
								<Badge variant="outline">{activity.status}</Badge>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.hero-grid {
		background-image:
			linear-gradient(
				to right,
				color-mix(in oklch, var(--border) 58%, transparent) 1px,
				transparent 1px
			),
			linear-gradient(
				to bottom,
				color-mix(in oklch, var(--border) 58%, transparent) 1px,
				transparent 1px
			);
		background-size: 56px 56px;
		mask-image: linear-gradient(to right, transparent, black 18%, black 78%, transparent);
	}

	.dashboard-shell {
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1.15rem;
		background: var(--background);
		box-shadow: 0 28px 70px color-mix(in oklch, var(--foreground) 10%, transparent);
	}

	.dashboard-topbar {
		display: flex;
		min-height: 3.25rem;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--border);
		padding: 0 1rem;
	}

	.dashboard-body {
		display: grid;
		grid-template-columns: 7.75rem minmax(0, 1fr);
		min-height: 31rem;
	}

	.activity-row {
		display: flex;
		min-height: 3rem;
		align-items: center;
		gap: 0.65rem;
		border-bottom: 1px solid var(--border);
		padding: 0.65rem 1rem;
	}

	.activity-row:last-child {
		border-bottom: 0;
	}

	@media (max-width: 639px) {
		.dashboard-body {
			grid-template-columns: minmax(0, 1fr);
			min-height: auto;
		}
	}
</style>
