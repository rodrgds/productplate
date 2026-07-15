<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import CircleIcon from '@lucide/svelte/icons/circle';
	import FilterIcon from '@lucide/svelte/icons/list-filter';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	interface Annotation {
		label: string;
		title: string;
		description: string;
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		annotations?: readonly Annotation[];
		ctaLabel?: string;
		ctaHref?: string;
	}

	let {
		kicker = 'Product spotlight',
		title = 'Show the interface and explain why each detail matters.',
		description = 'A focused product tour for the feature buyers need to understand. The annotations carry the story while the interface proves it is real.',
		annotations = [
			{
				label: '01',
				title: 'Search by intent',
				description:
					'Find the request behind the wording, even when teams describe the same need differently.'
			},
			{
				label: '02',
				title: 'Keep evidence attached',
				description:
					'Every theme stays connected to the accounts, notes, and messages that created it.'
			},
			{
				label: '03',
				title: 'Act from the result',
				description:
					'Assign, group, or publish an update without rebuilding the context somewhere else.'
			}
		],
		ctaLabel = 'Explore the product',
		ctaHref = '/auth/demo'
	}: Props = $props();

	const resultRows = [
		{ title: 'Bulk editing for catalog items', source: '12 requests', status: 'Planned' },
		{ title: 'Export filtered views to CSV', source: '8 requests', status: 'Review' },
		{ title: 'Saved filters for account teams', source: '6 requests', status: 'New' }
	] as const;
</script>

<section class="border-b py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
			<div>
				<Badge variant="outline">{kicker}</Badge>
				<h2 class="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
					{title}
				</h2>
			</div>
			<div class="max-w-2xl lg:justify-self-end">
				<p class="text-base leading-7 text-muted-foreground">{description}</p>
				<Button href={ctaHref} variant="link" class="mt-3 px-0">
					{ctaLabel}
					<ArrowRightIcon data-icon="inline-end" />
				</Button>
			</div>
		</div>

		<div class="spotlight-grid mt-12">
			<div class="spotlight-notes">
				{#each annotations as annotation (annotation.label)}
					<article>
						<span>{annotation.label}</span>
						<div>
							<h3>{annotation.title}</h3>
							<p>{annotation.description}</p>
						</div>
					</article>
				{/each}
			</div>

			<div class="spotlight-stage">
				<div class="spotlight-window">
					<div class="window-topbar">
						<div class="flex gap-1.5" aria-hidden="true">
							<span></span><span></span><span></span>
						</div>
						<p>Customer signals</p>
						<div class="size-6 rounded-full bg-muted"></div>
					</div>

					<div class="window-body">
						<div class="window-sidebar" aria-hidden="true">
							<span class="bg-primary"></span>
							<span></span><span></span><span></span><span></span>
						</div>

						<div class="window-content">
							<div class="flex items-start justify-between gap-4">
								<div>
									<p class="text-xs text-muted-foreground">Workspace / Insights</p>
									<h3 class="mt-1 text-base font-semibold">Search customer evidence</h3>
								</div>
								<Button size="sm">Create view</Button>
							</div>

							<div class="search-row">
								<SearchIcon class="size-4 text-muted-foreground" />
								<span class="min-w-0 flex-1 truncate">bulk editing and export</span>
								<kbd>⌘ K</kbd>
							</div>

							<div class="flex flex-wrap gap-2">
								<Badge variant="secondary"><FilterIcon /> Last 90 days</Badge>
								<Badge variant="outline">Enterprise</Badge>
								<Badge variant="outline">12 sources</Badge>
							</div>

							<div class="result-table">
								<div class="result-header">
									<span>Theme</span><span>Evidence</span><span>Status</span>
								</div>
								{#each resultRows as row, index (row.title)}
									<div class="result-row">
										<span class="flex min-w-0 items-center gap-2">
											{#if index === 0}
												<CheckIcon class="size-3.5 text-primary" />
											{:else}
												<CircleIcon class="size-3.5 text-muted-foreground" />
											{/if}
											<strong class="truncate">{row.title}</strong>
										</span>
										<span>{row.source}</span>
										<Badge variant={index === 0 ? 'secondary' : 'outline'}>{row.status}</Badge>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<div class="spotlight-callout">
					<span
						class="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground"
					>
						<CheckIcon class="size-4" />
					</span>
					<div>
						<p>Theme linked to 12 source records</p>
						<span>Every claim stays inspectable.</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.spotlight-grid {
		display: grid;
		gap: 1rem;
	}

	.spotlight-notes {
		display: grid;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
	}

	.spotlight-notes article {
		display: grid;
		grid-template-columns: 2.25rem minmax(0, 1fr);
		gap: 0.75rem;
		padding: 1.35rem;
	}

	.spotlight-notes article:not(:last-child) {
		border-bottom: 1px solid var(--border);
	}

	.spotlight-notes article > span {
		font-size: 0.72rem;
		font-weight: 650;
		color: var(--primary);
	}

	.spotlight-notes h3 {
		font-size: 0.95rem;
		font-weight: 650;
	}

	.spotlight-notes p {
		margin-top: 0.45rem;
		color: var(--muted-foreground);
		font-size: 0.875rem;
		line-height: 1.65;
	}

	.spotlight-stage {
		position: relative;
		display: grid;
		min-width: 0;
		align-items: center;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--muted);
		padding: clamp(1rem, 4vw, 2.5rem);
	}

	.spotlight-window {
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		background: var(--background);
		box-shadow: 0 22px 50px color-mix(in oklch, var(--foreground) 10%, transparent);
	}

	.window-topbar {
		display: grid;
		min-height: 2.9rem;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		border-bottom: 1px solid var(--border);
		padding: 0 0.9rem;
	}

	.window-topbar > div:first-child span {
		display: block;
		size: 0.45rem;
		border-radius: 999px;
		background: var(--muted-foreground);
		opacity: 0.35;
	}

	.window-topbar > div:last-child {
		justify-self: end;
	}

	.window-topbar p {
		font-size: 0.7rem;
		color: var(--muted-foreground);
	}

	.window-body {
		display: grid;
		grid-template-columns: 2.75rem minmax(0, 1fr);
		min-height: 27rem;
	}

	.window-sidebar {
		display: flex;
		align-items: center;
		flex-direction: column;
		gap: 0.8rem;
		border-right: 1px solid var(--border);
		padding: 1rem 0;
	}

	.window-sidebar span {
		display: block;
		size: 1.4rem;
		border-radius: 0.4rem;
		background: var(--muted);
	}

	.window-content {
		min-width: 0;
		padding: clamp(1rem, 3vw, 1.5rem);
	}

	.search-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin: 1.5rem 0 0.75rem;
		border: 1px solid var(--border);
		border-radius: 0.65rem;
		background: var(--card);
		padding: 0.7rem 0.8rem;
		font-size: 0.78rem;
	}

	.search-row kbd {
		border: 1px solid var(--border);
		border-radius: 0.35rem;
		background: var(--muted);
		padding: 0.15rem 0.35rem;
		font-size: 0.65rem;
		color: var(--muted-foreground);
	}

	.result-table {
		overflow: hidden;
		margin-top: 1rem;
		border: 1px solid var(--border);
		border-radius: 0.65rem;
	}

	.result-header,
	.result-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 5.5rem 4.5rem;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
	}

	.result-header {
		background: var(--muted);
		font-size: 0.68rem;
		font-weight: 600;
		color: var(--muted-foreground);
	}

	.result-row {
		border-top: 1px solid var(--border);
		font-size: 0.72rem;
	}

	.result-row > span:nth-child(2) {
		color: var(--muted-foreground);
	}

	.spotlight-callout {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: min(19rem, calc(100% - 3rem));
		margin: -1.5rem auto 0;
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		background: var(--background);
		padding: 0.75rem;
		box-shadow: 0 14px 30px color-mix(in oklch, var(--foreground) 12%, transparent);
	}

	.spotlight-callout p {
		font-size: 0.75rem;
		font-weight: 650;
	}

	.spotlight-callout span {
		font-size: 0.68rem;
		color: var(--muted-foreground);
	}

	@media (min-width: 900px) {
		.spotlight-grid {
			grid-template-columns: 18rem minmax(0, 1fr);
		}
	}

	@media (max-width: 560px) {
		.window-body {
			grid-template-columns: minmax(0, 1fr);
			min-height: auto;
		}

		.window-sidebar {
			display: none;
		}

		.result-header,
		.result-row {
			grid-template-columns: minmax(0, 1fr) 4.5rem;
		}

		.result-header span:nth-child(2),
		.result-row > span:nth-child(2) {
			display: none;
		}
	}
</style>
