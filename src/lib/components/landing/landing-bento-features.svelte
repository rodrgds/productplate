<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import BellRingIcon from '@lucide/svelte/icons/bell-ring';
	import BlocksIcon from '@lucide/svelte/icons/blocks';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import ChartNoAxesCombinedIcon from '@lucide/svelte/icons/chart-no-axes-combined';
	import FileCheck2Icon from '@lucide/svelte/icons/file-check-2';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import type { Component } from 'svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	interface FeatureItem {
		title: string;
		description: string;
		icon: Component;
		visual?: string;
		size?: 'wide' | 'tall' | 'normal';
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		items?: readonly FeatureItem[];
	}

	let {
		kicker = 'The product, at a glance',
		title = 'A feature section that behaves like a system map.',
		description = 'One composed product surface replaces a wall of interchangeable cards. Buyers can scan the operating model before they read every detail.',
		items = [
			{
				title: 'Realtime product signals',
				description: 'Live metrics expose movement, not a static dashboard promise.',
				icon: ChartNoAxesCombinedIcon
			},
			{
				title: 'Permission-ready flows',
				description: 'Every sensitive action has an owner and a visible state.',
				icon: ShieldCheckIcon
			},
			{
				title: 'Composable blocks',
				description: 'Ordinary Svelte files stay easy to move, rename, and delete.',
				icon: BlocksIcon
			},
			{
				title: 'Launch notes',
				description: 'Risk, proof, and follow-up live beside the work.',
				icon: FileCheck2Icon
			},
			{
				title: 'Production stack',
				description: 'The underlying services stay legible and replaceable.',
				icon: BlocksIcon
			},
			{
				title: 'Alertable states',
				description: 'Product events can become useful action without extra glue.',
				icon: BellRingIcon
			},
			{
				title: 'Activity calendar',
				description: 'One status vocabulary carries through time-based views.',
				icon: CalendarIcon
			}
		]
	}: Props = $props();

	const signalBars = [34, 48, 43, 61, 56, 72, 68, 84, 78, 94] as const;
	const permissions = [
		{ label: 'Workspace invite', state: 'Allowed' },
		{ label: 'Billing change', state: 'Review' },
		{ label: 'Data export', state: 'Owner only' },
		{ label: 'Account deletion', state: '2 approvals' }
	] as const;
	const runbook = [
		{ label: 'Swap product copy', done: true },
		{ label: 'Connect live screenshot', done: true },
		{ label: 'Point primary CTA', done: false },
		{ label: 'Remove unused routes', done: false }
	] as const;
	const stack = ['SvelteKit', 'Convex', 'Better Auth', 'Autumn', 'AI SDK'] as const;
</script>

<section class="border-b py-20 sm:py-24" data-testid="feature-bento">
	<div class="mx-auto max-w-7xl px-6">
		<header class="feature-header">
			<div>
				<Badge variant="outline">{kicker}</Badge>
				<h2>{title}</h2>
			</div>
			<p>{description}</p>
		</header>

		<div class="feature-bench">
			<aside class="feature-index" aria-label="Included product capabilities">
				<div class="index-heading">
					<span>Product map</span>
					<small>{items.length} capabilities</small>
				</div>

				<ol>
					{#each items as item, index (item.title)}
						<li class:active={index === 0}>
							<span>{String(index + 1).padStart(2, '0')}</span>
							<item.icon class="size-4" />
							<div>
								<strong>{item.title}</strong>
								<small>{item.description}</small>
							</div>
						</li>
					{/each}
				</ol>
			</aside>

			<div class="bench-canvas">
				<div class="canvas-topbar">
					<div>
						<span class="live-dot" aria-hidden="true"></span>
						<strong>Product heartbeat</strong>
					</div>
					<span>Updated just now</span>
				</div>

				<div class="signal-panel">
					<div class="signal-copy">
						<p>Activation this month</p>
						<strong>68%</strong>
						<span>Up 14 points after the onboarding release</span>
					</div>
					<div class="signal-chart" aria-hidden="true">
						{#each signalBars as height, index (index)}
							<i class:last={index === signalBars.length - 1} style={`height: ${height}%`}></i>
						{/each}
					</div>
					<div class="signal-note">
						<span>Best signal</span>
						<strong>Workspace created</strong>
						<small>83% continue to invite a teammate</small>
					</div>
				</div>

				<div class="canvas-split">
					<section class="permission-ledger" aria-labelledby="permission-ledger-title">
						<div class="module-heading">
							<div>
								<span>Access model</span>
								<h3 id="permission-ledger-title">Sensitive actions stay explicit</h3>
							</div>
							<ShieldCheckIcon class="size-5" />
						</div>
						<div class="ledger-rows">
							{#each permissions as permission (permission.label)}
								<div><span>{permission.label}</span><strong>{permission.state}</strong></div>
							{/each}
						</div>
					</section>

					<section class="launch-runbook" aria-labelledby="launch-runbook-title">
						<div class="module-heading">
							<div>
								<span>Launch runbook</span>
								<h3 id="launch-runbook-title">Four edits from starter to product</h3>
							</div>
							<FileCheck2Icon class="size-5" />
						</div>
						<div class="runbook-rows">
							{#each runbook as task, index (task.label)}
								<div class:done={task.done}>
									<span>{String(index + 1).padStart(2, '0')}</span>
									<strong>{task.label}</strong>
									<i aria-hidden="true"></i>
								</div>
							{/each}
						</div>
					</section>
				</div>

				<div class="stack-ribbon">
					<div>
						<span>Replaceable stack</span>
						{#each stack as service (service)}<strong>{service}</strong>{/each}
					</div>
					<Button href="#patterns" variant="ghost" size="sm">
						Inspect the pattern<ArrowRightIcon data-icon="inline-end" />
					</Button>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.feature-header {
		display: grid;
		gap: 2rem;
		align-items: end;
	}

	.feature-header h2 {
		max-width: 42rem;
		margin-top: 1.25rem;
		font-size: clamp(2.25rem, 5vw, 3.75rem);
		font-weight: 650;
		line-height: 0.98;
		letter-spacing: -0.05em;
		text-wrap: balance;
	}

	.feature-header > p {
		max-width: 36rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}

	.feature-bench {
		display: grid;
		overflow: hidden;
		margin-top: 3rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--background);
		box-shadow: 0 18px 42px color-mix(in oklch, var(--foreground) 6%, transparent);
	}

	.feature-index {
		background: var(--foreground);
		color: var(--background);
		padding: 1rem;
	}

	.index-heading,
	.canvas-topbar,
	.module-heading,
	.stack-ribbon,
	.stack-ribbon > div {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.index-heading {
		padding: 0.5rem 0.5rem 1rem;
		border-bottom: 1px solid color-mix(in oklch, var(--background) 16%, transparent);
	}

	.index-heading span {
		font-size: 0.75rem;
		font-weight: 650;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.index-heading small {
		font-size: 0.68rem;
		opacity: 0.55;
	}

	.feature-index ol {
		display: grid;
		margin-top: 0.5rem;
	}

	.feature-index li {
		display: grid;
		grid-template-columns: 1.5rem 1.25rem minmax(0, 1fr);
		align-items: start;
		gap: 0.6rem;
		padding: 0.9rem 0.5rem;
		border-bottom: 1px solid color-mix(in oklch, var(--background) 11%, transparent);
	}

	.feature-index li:last-child {
		border-bottom: 0;
	}

	.feature-index li.active {
		color: var(--primary);
	}

	.feature-index li > span {
		padding-top: 0.1rem;
		font-size: 0.65rem;
		opacity: 0.55;
	}

	.feature-index li :global(svg) {
		margin-top: 0.05rem;
		opacity: 0.7;
	}

	.feature-index strong,
	.feature-index small {
		display: block;
	}

	.feature-index strong {
		font-size: 0.78rem;
		font-weight: 650;
	}

	.feature-index small {
		margin-top: 0.25rem;
		font-size: 0.68rem;
		line-height: 1.45;
		opacity: 0.52;
	}

	.bench-canvas {
		min-width: 0;
	}

	.canvas-topbar {
		min-height: 3.5rem;
		padding: 0 1.25rem;
		border-bottom: 1px solid var(--border);
	}

	.canvas-topbar > div {
		display: flex;
		align-items: center;
		gap: 0.55rem;
	}

	.canvas-topbar strong {
		font-size: 0.8rem;
	}

	.canvas-topbar > span {
		font-size: 0.68rem;
		color: var(--muted-foreground);
	}

	.live-dot {
		display: block;
		size: 0.45rem;
		border-radius: 999px;
		background: var(--primary);
	}

	.signal-panel {
		display: grid;
		gap: 1.5rem;
		align-items: end;
		padding: clamp(1.5rem, 4vw, 2.5rem);
		border-bottom: 1px solid var(--border);
	}

	.signal-copy p,
	.signal-note span,
	.module-heading span,
	.stack-ribbon span {
		font-size: 0.68rem;
		font-weight: 650;
		color: var(--muted-foreground);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.signal-copy > strong {
		display: block;
		margin-top: 0.4rem;
		font-size: clamp(3rem, 7vw, 5rem);
		font-weight: 650;
		line-height: 0.9;
		letter-spacing: -0.06em;
	}

	.signal-copy > span,
	.signal-note small {
		display: block;
		margin-top: 0.65rem;
		color: var(--muted-foreground);
		font-size: 0.72rem;
	}

	.signal-chart {
		display: flex;
		height: 8rem;
		align-items: end;
		gap: 0.35rem;
		border-bottom: 1px solid var(--border);
	}

	.signal-chart i {
		display: block;
		min-width: 0.35rem;
		flex: 1;
		background: var(--muted);
	}

	.signal-chart i.last {
		background: var(--primary);
	}

	.signal-note {
		padding-left: 1rem;
		border-left: 1px solid var(--border);
	}

	.signal-note strong {
		display: block;
		margin-top: 0.5rem;
		font-size: 0.9rem;
	}

	.canvas-split {
		display: grid;
		border-bottom: 1px solid var(--border);
	}

	.permission-ledger,
	.launch-runbook {
		padding: clamp(1.5rem, 4vw, 2rem);
	}

	.module-heading {
		align-items: start;
	}

	.module-heading h3 {
		margin-top: 0.35rem;
		font-size: 1rem;
		font-weight: 650;
	}

	.module-heading > :global(svg) {
		color: var(--primary);
	}

	.ledger-rows,
	.runbook-rows {
		display: grid;
		margin-top: 1.25rem;
		border-top: 1px solid var(--border);
	}

	.ledger-rows > div,
	.runbook-rows > div {
		display: grid;
		min-height: 2.7rem;
		align-items: center;
		border-bottom: 1px solid var(--border);
		font-size: 0.72rem;
	}

	.ledger-rows > div {
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 1rem;
	}

	.ledger-rows strong {
		font-weight: 650;
		color: var(--muted-foreground);
	}

	.runbook-rows > div {
		grid-template-columns: 1.5rem minmax(0, 1fr) auto;
		gap: 0.5rem;
	}

	.runbook-rows span {
		color: var(--muted-foreground);
	}

	.runbook-rows strong {
		font-weight: 550;
	}

	.runbook-rows i {
		display: block;
		size: 0.55rem;
		border: 1px solid var(--muted-foreground);
		border-radius: 999px;
	}

	.runbook-rows .done i {
		border-color: var(--primary);
		background: var(--primary);
	}

	.stack-ribbon {
		min-height: 4.5rem;
		padding: 0.75rem 1rem 0.75rem 1.5rem;
		background: var(--muted);
	}

	.stack-ribbon > div {
		justify-content: flex-start;
		flex-wrap: wrap;
		gap: 0.5rem 0.9rem;
	}

	.stack-ribbon strong {
		font-size: 0.7rem;
		font-weight: 650;
	}

	@media (min-width: 900px) {
		.feature-header {
			grid-template-columns: 1fr 0.72fr;
		}

		.feature-bench {
			grid-template-columns: 18rem minmax(0, 1fr);
		}

		.signal-panel {
			grid-template-columns: minmax(10rem, 0.7fr) minmax(14rem, 1.3fr) minmax(10rem, 0.72fr);
		}

		.canvas-split {
			grid-template-columns: 1fr 1fr;
		}

		.permission-ledger {
			border-right: 1px solid var(--border);
		}
	}

	@media (max-width: 640px) {
		.feature-index small {
			display: none;
		}

		.feature-index ol {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.stack-ribbon {
			align-items: stretch;
			flex-direction: column;
		}

		.stack-ribbon :global(a) {
			width: 100%;
		}
	}
</style>
