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

<section class="dashboard-hero border-b" data-testid="dashboard-hero">
	<div class="hero-grid" aria-hidden="true"></div>
	<div class="relative mx-auto max-w-7xl px-6 pt-20 pb-16 sm:pt-24 lg:pt-28">
		<div class="hero-copy">
			<div>
				<Badge variant="outline"><SparklesIcon />{kicker}</Badge>
				<h1>{title}</h1>
			</div>
			<div class="hero-aside">
				<p>{description}</p>
				<div class="hero-actions">
					{#each actions as action (action.label)}
						<Button href={action.href} variant={action.variant ?? 'default'} size="lg">
							{action.label}
							{#if !action.variant || action.variant === 'default'}
								<ArrowRightIcon data-icon="inline-end" />
							{/if}
						</Button>
					{/each}
				</div>
				<div class="logo-line" aria-label="Trusted customers">
					<span>Trusted by</span>
					{#each customerLogos as logo (logo)}<strong>{logo}</strong>{/each}
				</div>
			</div>
		</div>

		<div class="dashboard-shell">
			<div class="dashboard-topbar">
				<div class="flex items-center gap-2">
					<span class="app-mark"><CommandIcon class="size-3.5" /></span>
					<strong>Operations</strong>
					<span class="workspace-path">/ Weekly rhythm</span>
				</div>
				<div class="sync-state"><span></span>All systems current</div>
			</div>

			<div class="dashboard-body">
				<aside aria-label="Workspace navigation">
					<p>Workspace</p>
					{#each ['Overview', 'Workflows', 'Customers', 'Reports'] as item, index (item)}
						<span class:active={index === 0}>{item}</span>
					{/each}
					<div class="side-note">
						<small>Next brief</small>
						<strong>Today, 4:00 PM</strong>
					</div>
				</aside>

				<div class="dashboard-main">
					<div class="dashboard-summary">
						<div>
							<p>Tuesday, 16 July</p>
							<h2>Good morning, Maya</h2>
						</div>
						<div class="summary-metrics">
							<div><span>On track</span><strong>14</strong></div>
							<div><span>Needs review</span><strong>3</strong></div>
							<div><span>Closed this week</span><strong>28</strong></div>
						</div>
					</div>

					<div class="dashboard-content">
						<div class="activity-table">
							<div class="table-heading">
								<span>Active workflow</span><span>Owner</span><span>Status</span>
							</div>
							{#each activities as activity, index (activity.label)}
								<div class="activity-row">
									<span class="row-index">{String(index + 1).padStart(2, '0')}</span>
									<strong>{activity.label}</strong>
									<span>{activity.owner}</span>
									<Badge variant={index === 1 ? 'secondary' : 'outline'}>{activity.status}</Badge>
								</div>
							{/each}
						</div>

						<div class="velocity-panel">
							<div>
								<p>Work completed</p>
								<strong>+18%</strong>
							</div>
							<div class="velocity-chart" aria-hidden="true">
								{#each bars as height, index (index)}
									<i class:last={index === bars.length - 1} style={`height: ${height}%`}></i>
								{/each}
							</div>
							<div class="next-action">
								<span><CheckIcon class="size-3.5" /></span>
								<p>Renewal-risk brief prepared automatically.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.dashboard-hero {
		position: relative;
		overflow: hidden;
		background: var(--background);
	}

	.hero-grid {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(
				to right,
				color-mix(in oklch, var(--border) 52%, transparent) 1px,
				transparent 1px
			),
			linear-gradient(
				to bottom,
				color-mix(in oklch, var(--border) 52%, transparent) 1px,
				transparent 1px
			);
		background-size: 64px 64px;
		mask-image: linear-gradient(to bottom, black, transparent 58%);
	}

	.hero-copy {
		display: grid;
		gap: 2.5rem;
		align-items: end;
	}

	.hero-copy h1 {
		max-width: 50rem;
		margin-top: 1.5rem;
		font-size: clamp(3.75rem, 8vw, 7.5rem);
		font-weight: 650;
		line-height: 0.84;
		letter-spacing: -0.075em;
		text-wrap: balance;
	}

	.hero-aside > p {
		max-width: 34rem;
		font-size: 1.05rem;
		line-height: 1.75;
		color: var(--muted-foreground);
	}

	.hero-actions,
	.logo-line {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.65rem;
	}

	.hero-actions {
		margin-top: 1.75rem;
	}

	.logo-line {
		margin-top: 2rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--border);
		gap: 0.6rem 1rem;
		font-size: 0.7rem;
	}

	.logo-line span {
		color: var(--muted-foreground);
	}

	.logo-line strong {
		font-weight: 650;
	}

	.dashboard-shell {
		position: relative;
		overflow: hidden;
		margin-top: clamp(3.5rem, 8vw, 6rem);
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--background);
		box-shadow: 0 30px 80px color-mix(in oklch, var(--foreground) 10%, transparent);
	}

	.dashboard-topbar {
		display: flex;
		min-height: 3.4rem;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid var(--border);
		padding: 0 1rem;
	}

	.dashboard-topbar strong,
	.sync-state {
		font-size: 0.75rem;
		font-weight: 650;
	}

	.app-mark {
		display: grid;
		size: 1.8rem;
		place-items: center;
		border-radius: 0.45rem;
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.workspace-path {
		font-size: 0.72rem;
		color: var(--muted-foreground);
	}

	.sync-state {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--muted-foreground);
	}

	.sync-state span {
		display: block;
		size: 0.45rem;
		border-radius: 999px;
		background: var(--primary);
	}

	.dashboard-body {
		display: grid;
	}

	.dashboard-body > aside {
		display: none;
		border-right: 1px solid var(--border);
		background: var(--muted);
		padding: 1rem;
	}

	.dashboard-body > aside > p {
		margin: 0.4rem 0.65rem 0.75rem;
		font-size: 0.65rem;
		font-weight: 650;
		color: var(--muted-foreground);
		text-transform: uppercase;
	}

	.dashboard-body > aside > span {
		display: block;
		margin-top: 0.2rem;
		border-radius: 0.5rem;
		padding: 0.65rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--muted-foreground);
	}

	.dashboard-body > aside > span.active {
		background: var(--background);
		color: var(--foreground);
	}

	.side-note {
		margin-top: auto;
		border-top: 1px solid var(--border);
		padding: 1rem 0.65rem 0;
	}

	.side-note small,
	.side-note strong {
		display: block;
		font-size: 0.68rem;
	}

	.side-note small {
		color: var(--muted-foreground);
	}

	.side-note strong {
		margin-top: 0.25rem;
	}

	.dashboard-main {
		min-width: 0;
	}

	.dashboard-summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		padding: clamp(1.25rem, 3vw, 2rem);
		border-bottom: 1px solid var(--border);
	}

	.dashboard-summary p,
	.summary-metrics span,
	.velocity-panel p {
		font-size: 0.68rem;
		color: var(--muted-foreground);
	}

	.dashboard-summary h2 {
		margin-top: 0.25rem;
		font-size: 1.35rem;
		font-weight: 650;
		letter-spacing: -0.03em;
	}

	.summary-metrics {
		display: none;
		gap: 2rem;
	}

	.summary-metrics div {
		min-width: 5rem;
	}

	.summary-metrics span,
	.summary-metrics strong {
		display: block;
	}

	.summary-metrics strong {
		margin-top: 0.25rem;
		font-size: 1.25rem;
	}

	.dashboard-content {
		display: grid;
	}

	.table-heading,
	.activity-row {
		display: grid;
		align-items: center;
		gap: 0.75rem;
		padding: 0.8rem 1rem;
	}

	.table-heading {
		grid-template-columns: minmax(0, 1fr) 5rem 5rem;
		background: var(--muted);
		font-size: 0.65rem;
		font-weight: 650;
		color: var(--muted-foreground);
	}

	.activity-row {
		grid-template-columns: 1.5rem minmax(0, 1fr) 5rem 5rem;
		min-height: 4rem;
		border-bottom: 1px solid var(--border);
		font-size: 0.72rem;
	}

	.activity-row > strong {
		font-weight: 650;
	}

	.activity-row > span:not(.row-index) {
		color: var(--muted-foreground);
	}

	.row-index {
		font-size: 0.65rem;
		color: var(--primary);
	}

	.velocity-panel {
		display: grid;
		padding: 1.25rem;
		background: var(--foreground);
		color: var(--background);
	}

	.velocity-panel > div:first-child {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}

	.velocity-panel > div:first-child strong {
		font-size: 1rem;
		color: var(--primary);
	}

	.velocity-chart {
		display: flex;
		height: 7rem;
		align-items: end;
		gap: 0.3rem;
		margin-top: 1.25rem;
		border-bottom: 1px solid color-mix(in oklch, var(--background) 18%, transparent);
	}

	.velocity-chart i {
		display: block;
		min-width: 0.25rem;
		flex: 1;
		background: color-mix(in oklch, var(--background) 22%, transparent);
	}

	.velocity-chart i.last {
		background: var(--primary);
	}

	.next-action {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		margin-top: 1rem;
	}

	.next-action > span {
		display: grid;
		size: 1.5rem;
		flex: none;
		place-items: center;
		border-radius: 999px;
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.next-action p {
		color: color-mix(in oklch, var(--background) 70%, transparent);
	}

	@media (min-width: 800px) {
		.hero-copy {
			grid-template-columns: minmax(0, 1.25fr) minmax(22rem, 0.75fr);
		}

		.dashboard-body {
			grid-template-columns: 10rem minmax(0, 1fr);
		}

		.dashboard-body > aside {
			display: flex;
			flex-direction: column;
		}

		.summary-metrics {
			display: flex;
		}

		.dashboard-content {
			grid-template-columns: minmax(0, 1.3fr) minmax(15rem, 0.7fr);
		}

		.velocity-panel {
			border-left: 1px solid var(--border);
		}
	}

	@media (max-width: 560px) {
		.workspace-path,
		.sync-state {
			display: none;
		}

		.table-heading {
			display: none;
		}

		.activity-row {
			grid-template-columns: 1.5rem minmax(0, 1fr) auto;
		}

		.activity-row > span:not(.row-index) {
			display: none;
		}
	}
</style>
