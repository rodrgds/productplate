<script lang="ts">
	import ActivityIcon from '@lucide/svelte/icons/activity';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
	import Clock3Icon from '@lucide/svelte/icons/clock-3';
	import CrosshairIcon from '@lucide/svelte/icons/crosshair';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import RadioTowerIcon from '@lucide/svelte/icons/radio-tower';
	import RouteIcon from '@lucide/svelte/icons/route';
	import { APP_NAME } from '$lib/constants.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	type SiteStatus = 'active' | 'at-risk' | 'scheduled';
	type StatusFilter = SiteStatus | 'all';

	interface Site {
		id: string;
		name: string;
		city: string;
		region: string;
		status: SiteStatus;
		x: number;
		y: number;
		load: number;
		latency: number;
		owner: string;
		revenue: string;
		note: string;
	}

	const statusFilters: readonly { id: StatusFilter; label: string }[] = [
		{ id: 'all', label: 'All' },
		{ id: 'active', label: 'Active' },
		{ id: 'at-risk', label: 'At risk' },
		{ id: 'scheduled', label: 'Scheduled' }
	];

	const statusMeta: Record<
		SiteStatus,
		{ label: string; icon: typeof CheckCircle2Icon; tone: string }
	> = {
		active: { label: 'Active', icon: CheckCircle2Icon, tone: 'good' },
		'at-risk': { label: 'At risk', icon: AlertCircleIcon, tone: 'risk' },
		scheduled: { label: 'Scheduled', icon: Clock3Icon, tone: 'queued' }
	};

	const sites: readonly Site[] = [
		{
			id: 'lisbon',
			name: 'Lisbon launch',
			city: 'Lisbon',
			region: 'Western Europe',
			status: 'active',
			x: 29,
			y: 58,
			load: 68,
			latency: 42,
			owner: 'Growth',
			revenue: '$42.8k',
			note: 'Live region with steady conversion and healthy event volume.'
		},
		{
			id: 'berlin',
			name: 'Berlin rollout',
			city: 'Berlin',
			region: 'Central Europe',
			status: 'at-risk',
			x: 55,
			y: 34,
			load: 91,
			latency: 76,
			owner: 'Operations',
			revenue: '$31.4k',
			note: 'Traffic is above the current capacity target. Review rate limits before launch week.'
		},
		{
			id: 'stockholm',
			name: 'Stockholm pilot',
			city: 'Stockholm',
			region: 'Nordics',
			status: 'scheduled',
			x: 62,
			y: 18,
			load: 33,
			latency: 55,
			owner: 'Product',
			revenue: '$12.9k',
			note: 'Pilot is queued for onboarding after billing plan copy is finalized.'
		},
		{
			id: 'madrid',
			name: 'Madrid expansion',
			city: 'Madrid',
			region: 'Iberia',
			status: 'active',
			x: 34,
			y: 72,
			load: 61,
			latency: 48,
			owner: 'Sales',
			revenue: '$28.6k',
			note: 'Expansion is ready for a second campaign once the import workflow lands.'
		},
		{
			id: 'vienna',
			name: 'Vienna support',
			city: 'Vienna',
			region: 'Central Europe',
			status: 'active',
			x: 61,
			y: 51,
			load: 57,
			latency: 39,
			owner: 'Success',
			revenue: '$19.3k',
			note: 'Support response times are stable and the account list is fully synced.'
		}
	];

	let selectedSiteId = $state(sites[0].id);
	let statusFilter = $state<StatusFilter>('all');

	let visibleSites = $derived(
		statusFilter === 'all' ? sites : sites.filter((site) => site.status === statusFilter)
	);
	let selectedSite = $derived(sites.find((site) => site.id === selectedSiteId) ?? sites[0]);
	let selectedMeta = $derived(statusMeta[selectedSite.status]);
	let averageLoad = $derived(
		Math.round(sites.reduce((total, site) => total + site.load, 0) / sites.length)
	);
	let atRiskCount = $derived(sites.filter((site) => site.status === 'at-risk').length);

	function selectSite(site: Site) {
		selectedSiteId = site.id;
	}
</script>

<svelte:head>
	<title>Map | {APP_NAME}</title>
</svelte:head>

<header
	class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium">Map</h1>
	</div>
</header>

<main class="min-h-[calc(100vh-4rem)] bg-muted/30 p-4 lg:p-6">
	<div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
		<section class="map-shell" aria-label="Regional launch map">
			<div class="map-header">
				<div>
					<Badge variant="outline">Starter feature</Badge>
					<h2>Regional launch map</h2>
					<p>
						A no-key map surface for product demos, logistics tools, marketplace coverage, or field
						operations.
					</p>
				</div>
				<div class="filter-bar" role="group" aria-label="Map status filter">
					{#each statusFilters as filter (filter.id)}
						<button
							type="button"
							class:active-filter={statusFilter === filter.id}
							aria-pressed={statusFilter === filter.id}
							onclick={() => (statusFilter = filter.id)}
						>
							{filter.label}
						</button>
					{/each}
				</div>
			</div>

			<div class="map-canvas">
				<svg
					class="route-lines"
					viewBox="0 0 100 100"
					preserveAspectRatio="none"
					aria-hidden="true"
				>
					<polyline points="29,58 34,72 55,34 61,51 62,18" />
				</svg>
				{#each visibleSites as site (site.id)}
					{@const meta = statusMeta[site.status]}
					<button
						type="button"
						class="site-marker {meta.tone}"
						class:selected-marker={selectedSite.id === site.id}
						style={`left: ${site.x}%; top: ${site.y}%;`}
						aria-label={`Select ${site.city}`}
						aria-pressed={selectedSite.id === site.id}
						onclick={() => selectSite(site)}
					>
						<MapPinIcon class="size-4" />
						<span>{site.city}</span>
					</button>
				{/each}
				<div class="map-scale">
					<RouteIcon class="size-4" />
					<span>{visibleSites.length} visible sites</span>
				</div>
			</div>
		</section>

		<aside class="details-panel" aria-label="Selected site details">
			<div class="site-title">
				<div>
					<p>{selectedSite.region}</p>
					<h2>{selectedSite.name}</h2>
				</div>
				<Badge class={selectedMeta.tone} variant="outline">
					<selectedMeta.icon />
					{selectedMeta.label}
				</Badge>
			</div>

			<div class="metric-grid">
				<div>
					<ActivityIcon class="size-4" />
					<span>{selectedSite.load}%</span>
					<p>Load</p>
				</div>
				<div>
					<RadioTowerIcon class="size-4" />
					<span>{selectedSite.latency} ms</span>
					<p>Latency</p>
				</div>
				<div>
					<CrosshairIcon class="size-4" />
					<span>{selectedSite.revenue}</span>
					<p>Pipeline</p>
				</div>
			</div>

			<section class="site-note">
				<h3>Current readout</h3>
				<p>{selectedSite.note}</p>
			</section>

			<section class="site-list">
				<h3>Sites</h3>
				<div>
					{#each sites as site (site.id)}
						<button
							type="button"
							class:selected-row={selectedSite.id === site.id}
							onclick={() => selectSite(site)}
						>
							<span>{site.city}</span>
							<small>{statusMeta[site.status].label}</small>
						</button>
					{/each}
				</div>
			</section>

			<div class="summary-strip">
				<div>
					<span>{averageLoad}%</span>
					<p>Avg load</p>
				</div>
				<div>
					<span>{atRiskCount}</span>
					<p>Needs review</p>
				</div>
			</div>
		</aside>
	</div>
</main>

<style>
	.map-shell,
	.details-panel {
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--background);
		box-shadow: 0 1px 2px color-mix(in oklch, var(--foreground) 5%, transparent);
	}

	.map-shell {
		overflow: hidden;
	}

	.map-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid var(--border);
		padding: 1.25rem;
	}

	.map-header h2 {
		margin: 0.75rem 0 0;
		font-size: 1.35rem;
		font-weight: 650;
	}

	.map-header p {
		margin: 0.3rem 0 0;
		max-width: 35rem;
		color: var(--muted-foreground);
		font-size: 0.92rem;
		line-height: 1.6;
	}

	.filter-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		justify-content: flex-end;
	}

	.filter-bar button {
		min-height: 2rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--background);
		padding: 0 0.75rem;
		color: var(--muted-foreground);
		font: inherit;
		font-size: 0.82rem;
		font-weight: 650;
		transition:
			border-color 140ms ease,
			background-color 140ms ease,
			color 140ms ease;
	}

	.active-filter {
		border-color: var(--primary) !important;
		background: var(--primary) !important;
		color: var(--primary-foreground) !important;
	}

	.map-canvas {
		position: relative;
		isolation: isolate;
		min-height: min(62vh, 42rem);
		overflow: hidden;
		background:
			linear-gradient(
				90deg,
				color-mix(in oklch, var(--foreground) 6%, transparent) 1px,
				transparent 1px
			),
			linear-gradient(color-mix(in oklch, var(--foreground) 6%, transparent) 1px, transparent 1px),
			linear-gradient(135deg, var(--muted), var(--background));
		background-size:
			4.5rem 4.5rem,
			4.5rem 4.5rem,
			100% 100%;
	}

	.map-canvas::before,
	.map-canvas::after {
		position: absolute;
		z-index: -1;
		content: '';
		inset: 10% 8%;
		border: 1px solid color-mix(in oklch, var(--foreground) 10%, transparent);
		border-radius: 42% 58% 48% 52%;
		transform: rotate(-9deg);
	}

	.map-canvas::after {
		inset: 24% 22%;
		border-radius: 48% 52% 58% 42%;
		transform: rotate(14deg);
	}

	.route-lines {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.route-lines polyline {
		fill: none;
		stroke: color-mix(in oklch, var(--primary) 55%, transparent);
		stroke-dasharray: 2 2;
		stroke-linecap: round;
		stroke-width: 0.35;
	}

	.site-marker {
		position: absolute;
		z-index: 2;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 2.15rem;
		max-width: 11rem;
		transform: translate(-50%, -50%);
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--background);
		padding: 0 0.7rem;
		color: var(--foreground);
		font: inherit;
		font-size: 0.8rem;
		font-weight: 700;
		box-shadow: 0 8px 22px color-mix(in oklch, var(--foreground) 12%, transparent);
		transition:
			transform 140ms ease,
			border-color 140ms ease,
			background-color 140ms ease;
	}

	.site-marker:hover,
	.selected-marker {
		transform: translate(-50%, -50%) scale(1.04);
		border-color: var(--primary);
		background: color-mix(in oklch, var(--primary) 10%, var(--background));
	}

	.good :global(svg),
	:global(.good) {
		color: oklch(0.55 0.14 155);
	}

	.risk :global(svg),
	:global(.risk) {
		color: oklch(0.6 0.2 42);
	}

	.queued :global(svg),
	:global(.queued) {
		color: oklch(0.52 0.12 248);
	}

	.map-scale {
		position: absolute;
		right: 1rem;
		bottom: 1rem;
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		background: color-mix(in oklch, var(--background) 92%, transparent);
		padding: 0.55rem 0.7rem;
		font-size: 0.78rem;
		font-weight: 650;
		color: var(--muted-foreground);
	}

	.details-panel {
		display: grid;
		align-content: start;
		gap: 1.25rem;
		padding: 1.25rem;
	}

	.site-title {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.site-title p,
	.site-title h2,
	.site-note h3,
	.site-note p,
	.site-list h3 {
		margin: 0;
	}

	.site-title p {
		color: var(--muted-foreground);
		font-size: 0.82rem;
		font-weight: 650;
	}

	.site-title h2 {
		margin-top: 0.3rem;
		font-size: 1.25rem;
		font-weight: 650;
	}

	.metric-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.6rem;
	}

	.metric-grid div,
	.summary-strip div {
		display: grid;
		gap: 0.35rem;
		border: 1px solid var(--border);
		border-radius: 0.8rem;
		background: var(--muted);
		padding: 0.8rem;
	}

	.metric-grid span,
	.summary-strip span {
		font-size: 1rem;
		font-weight: 700;
	}

	.metric-grid p,
	.summary-strip p {
		margin: 0;
		color: var(--muted-foreground);
		font-size: 0.74rem;
		font-weight: 650;
	}

	.site-note,
	.site-list {
		display: grid;
		gap: 0.7rem;
	}

	.site-note h3,
	.site-list h3 {
		font-size: 0.92rem;
		font-weight: 650;
	}

	.site-note p {
		color: var(--muted-foreground);
		font-size: 0.9rem;
		line-height: 1.6;
	}

	.site-list > div {
		display: grid;
		gap: 0.45rem;
	}

	.site-list button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 2.45rem;
		border: 1px solid var(--border);
		border-radius: 0.7rem;
		background: var(--background);
		padding: 0 0.75rem;
		color: var(--foreground);
		font: inherit;
		font-size: 0.86rem;
		font-weight: 650;
	}

	.site-list small {
		color: var(--muted-foreground);
		font-size: 0.74rem;
	}

	.selected-row {
		border-color: color-mix(in oklch, var(--primary) 55%, var(--border)) !important;
		background: color-mix(in oklch, var(--primary) 8%, var(--background)) !important;
	}

	.summary-strip {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.6rem;
	}

	@media (max-width: 760px) {
		.map-header,
		.site-title {
			flex-direction: column;
		}

		.filter-bar {
			justify-content: flex-start;
		}

		.map-canvas {
			min-height: 30rem;
		}

		.site-marker span {
			display: none;
		}
	}
</style>
