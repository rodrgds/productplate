<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import BellRingIcon from '@lucide/svelte/icons/bell-ring';
	import BlocksIcon from '@lucide/svelte/icons/blocks';
	import ChartNoAxesCombinedIcon from '@lucide/svelte/icons/chart-no-axes-combined';
	import FileCheck2Icon from '@lucide/svelte/icons/file-check-2';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import type { Component } from 'svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	type FeatureVisual = 'analytics' | 'permissions' | 'blocks' | 'notes' | 'stack' | 'alerts';

	interface FeatureItem {
		title: string;
		description: string;
		icon: Component;
		visual: FeatureVisual;
		size?: 'wide' | 'tall' | 'normal';
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		items?: readonly FeatureItem[];
	}

	let {
		kicker = 'Feature bento',
		title = 'A denser section for the capabilities that sell the product.',
		description = 'Adapted from Magic UI and Aceternity bento patterns: varied cells, real UI backgrounds, and a quiet hover reveal instead of scroll choreography.',
		items = [
			{
				title: 'Realtime product signals',
				description:
					'Show live metrics and chart movement instead of an abstract dashboard promise.',
				icon: ChartNoAxesCombinedIcon,
				visual: 'analytics',
				size: 'wide'
			},
			{
				title: 'Permission-ready flows',
				description: 'Auth, billing, and settings patterns share the same product shell.',
				icon: ShieldCheckIcon,
				visual: 'permissions',
				size: 'tall'
			},
			{
				title: 'Composable blocks',
				description: 'Sections are ordinary Svelte files with props and local dummy data.',
				icon: BlocksIcon,
				visual: 'blocks'
			},
			{
				title: 'Launch notes',
				description: 'Use compact checklists when a feature needs proof, risk, and owner context.',
				icon: FileCheck2Icon,
				visual: 'notes'
			},
			{
				title: 'Production stack',
				description: 'Explain the boring but important services without making a logo pile.',
				icon: BlocksIcon,
				visual: 'stack'
			},
			{
				title: 'Alertable states',
				description: 'Status rows, badges, and calls-to-action are ready for backend data.',
				icon: BellRingIcon,
				visual: 'alerts'
			}
		]
	}: Props = $props();

	const metrics = [
		{ label: 'Acquisition', value: '42%', scale: 42 },
		{ label: 'Activation', value: '68%', scale: 68 },
		{ label: 'Revenue', value: '91%', scale: 91 }
	] as const;

	const permissions = [
		'Protected route',
		'Checkout event',
		'Profile update',
		'Role change'
	] as const;
	const stack = ['SvelteKit', 'Convex', 'Better Auth', 'Autumn', 'AI SDK'] as const;
	const chartBars = [28, 48, 36, 64, 52, 78] as const;
</script>

<section class="border-y bg-muted/30 py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
			<div>
				<Badge variant="outline">{kicker}</Badge>
				<h2 class="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
					{title}
				</h2>
			</div>
			<p class="max-w-2xl text-lg leading-8 text-muted-foreground lg:justify-self-end">
				{description}
			</p>
		</div>

		<div class="mt-12 grid auto-rows-[22rem] grid-cols-1 gap-4 lg:grid-cols-3">
			{#each items as item (item.title)}
				<article
					class={[
						'bento-card group',
						item.size === 'wide' ? 'lg:col-span-2' : '',
						item.size === 'tall' ? 'lg:row-span-2' : ''
					]
						.filter(Boolean)
						.join(' ')}
				>
					<div class="bento-background">
						{#if item.visual === 'analytics'}
							<div class="analytics-panel">
								<div class="flex items-center justify-between border-b pb-3">
									<div>
										<p class="text-sm font-semibold">Campaign overview</p>
										<p class="mt-1 text-xs text-muted-foreground">Last 30 days</p>
									</div>
									<Badge variant="secondary">Live</Badge>
								</div>
								<div class="mt-4 grid gap-3 sm:grid-cols-3">
									{#each metrics as metric (metric.label)}
										<div class="rounded-lg border bg-background p-3">
											<p class="text-xs text-muted-foreground">{metric.label}</p>
											<p class="mt-2 text-2xl font-semibold">{metric.value}</p>
											<div class="mt-3 flex h-16 items-end gap-1">
												{#each chartBars as height, index (index)}
													<span
														class="flex-1 rounded-t-sm bg-primary"
														style={`height: ${Math.max(18, (height * metric.scale) / 100)}%`}
													></span>
												{/each}
											</div>
										</div>
									{/each}
								</div>
							</div>
						{:else if item.visual === 'permissions'}
							<div class="permissions-panel">
								{#each permissions as permission (permission)}
									<div
										class="flex items-center justify-between rounded-lg border bg-background px-3 py-2"
									>
										<span class="text-sm">{permission}</span>
										<Badge variant="secondary">Ready</Badge>
									</div>
								{/each}
							</div>
						{:else if item.visual === 'blocks'}
							<div class="blocks-panel" aria-hidden="true">
								<span></span>
								<span></span>
								<span></span>
								<span></span>
								<span></span>
								<span></span>
							</div>
						{:else if item.visual === 'notes'}
							<div class="notes-panel">
								<p class="text-sm font-semibold">Ship checklist</p>
								{#each ['Swap copy', 'Attach screenshot', 'Point CTA', 'Cut unused sections'] as note (note)}
									<div class="mt-3 flex items-center gap-2 text-sm">
										<span class="size-2 rounded-full bg-primary"></span>
										<span>{note}</span>
									</div>
								{/each}
							</div>
						{:else if item.visual === 'stack'}
							<div class="stack-panel">
								{#each stack as service, index (service)}
									<span style={`--stack-index: ${index}`}>{service}</span>
								{/each}
							</div>
						{:else}
							<div class="alerts-panel">
								{#each ['Trial started', 'Plan upgraded', 'Invite accepted'] as alert (alert)}
									<div class="rounded-lg border bg-background px-3 py-2">
										<p class="text-sm font-medium">{alert}</p>
										<p class="mt-1 text-xs text-muted-foreground">Synced to product state</p>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<div class="bento-copy">
						<item.icon
							class="size-10 text-foreground/75 transition-transform duration-300 group-hover:scale-90"
						/>
						<h3 class="mt-3 text-xl font-semibold tracking-tight">{item.title}</h3>
						<p class="mt-2 max-w-lg leading-7 text-muted-foreground">{item.description}</p>
					</div>

					<div class="bento-cta">
						<Button href="#patterns" variant="link" size="sm" class="p-0">
							Use this pattern
							<ArrowRightIcon data-icon="inline-end" />
						</Button>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.bento-card {
		position: relative;
		display: flex;
		overflow: hidden;
		min-height: 22rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
		box-shadow:
			0 0 0 1px color-mix(in oklch, var(--foreground) 3%, transparent),
			0 2px 4px color-mix(in oklch, var(--foreground) 5%, transparent),
			0 12px 24px color-mix(in oklch, var(--foreground) 5%, transparent);
	}

	.bento-card::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		transition: background-color 220ms ease;
	}

	.bento-card:hover::after {
		background: color-mix(in oklch, var(--foreground) 3%, transparent);
	}

	.bento-background {
		position: absolute;
		inset: 0 0 8rem;
		overflow: hidden;
		padding: 1rem;
		opacity: 0.96;
	}

	.bento-copy {
		position: relative;
		z-index: 1;
		margin-top: auto;
		padding: 1.25rem;
		transition: transform 240ms ease;
	}

	.bento-card:hover .bento-copy {
		transform: translateY(-2.25rem);
	}

	.bento-cta {
		position: absolute;
		z-index: 2;
		left: 1.25rem;
		bottom: 1.1rem;
		opacity: 0;
		transform: translateY(0.6rem);
		transition:
			opacity 220ms ease,
			transform 220ms ease;
	}

	.bento-card:hover .bento-cta {
		opacity: 1;
		transform: translateY(0);
	}

	.analytics-panel,
	.permissions-panel,
	.notes-panel,
	.alerts-panel {
		border: 1px solid var(--border);
		border-radius: 0.875rem;
		background: color-mix(in oklch, var(--background) 88%, transparent);
		padding: 1rem;
		box-shadow: 0 12px 24px color-mix(in oklch, var(--foreground) 5%, transparent);
	}

	.permissions-panel,
	.alerts-panel {
		display: grid;
		gap: 0.65rem;
	}

	.blocks-panel {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.55rem;
		width: min(18rem, 82%);
		margin: 0 auto;
		padding-top: 1rem;
	}

	.blocks-panel span {
		min-height: 4.25rem;
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		background: color-mix(in oklch, var(--muted) 70%, var(--background));
	}

	.blocks-panel span:nth-child(1),
	.blocks-panel span:nth-child(6) {
		grid-column: span 2;
	}

	.notes-panel {
		width: min(18rem, 86%);
		margin-left: auto;
	}

	.stack-panel {
		position: relative;
		width: min(21rem, 92%);
		height: 13rem;
		margin: 0 auto;
	}

	.stack-panel span {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 9rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--background);
		padding: 0.55rem 0.75rem;
		text-align: center;
		font-size: 0.8rem;
		font-weight: 650;
		box-shadow: 0 12px 20px color-mix(in oklch, var(--foreground) 5%, transparent);
		transform: translate(-50%, -50%) rotate(calc((var(--stack-index) - 2) * 7deg))
			translateY(calc((var(--stack-index) - 2) * 1.2rem));
	}

	@media (max-width: 1023px) {
		.bento-card:hover .bento-copy {
			transform: none;
		}

		.bento-cta {
			position: relative;
			left: auto;
			bottom: auto;
			align-self: end;
			margin: auto 1.25rem 1.1rem;
			opacity: 1;
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bento-card,
		.bento-card *,
		.bento-card::after {
			transition: none;
		}
	}
</style>
