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
		kicker = 'Product x-ray',
		title = 'Make the interface carry the explanation.',
		description = 'Numbered callouts connect the product surface to buyer value without surrounding it with another stack of cards.',
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
					'Assign, group, or publish an update without rebuilding context somewhere else.'
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

<section class="border-b py-20 sm:py-24" data-testid="feature-spotlight">
	<div class="mx-auto max-w-7xl px-6">
		<header class="spotlight-header">
			<div>
				<Badge variant="outline">{kicker}</Badge>
				<h2>{title}</h2>
			</div>
			<div>
				<p>{description}</p>
				<Button href={ctaHref} variant="link" class="mt-3 px-0"
					>{ctaLabel}<ArrowRightIcon data-icon="inline-end" /></Button
				>
			</div>
		</header>

		<div class="spotlight-stage">
			<div class="spotlight-window">
				<div class="window-topbar">
					<div><span></span><span></span><span></span></div>
					<p>Customer signals</p>
					<small>Workspace / Insights</small>
				</div>
				<div class="window-content">
					<div class="content-heading">
						<div>
							<p>Evidence search</p>
							<h3>What are customers asking for?</h3>
						</div>
						<Button size="sm">Create view</Button>
					</div>
					<div class="search-row">
						<SearchIcon class="size-4" /><span>bulk editing and export</span><kbd>⌘ K</kbd>
					</div>
					<div class="filter-row">
						<Badge variant="secondary"><FilterIcon />Last 90 days</Badge><Badge variant="outline"
							>Enterprise</Badge
						><Badge variant="outline">12 sources</Badge>
					</div>
					<div class="result-table">
						<div class="result-header">
							<span>Theme</span><span>Evidence</span><span>Status</span>
						</div>
						{#each resultRows as row, index (row.title)}
							<div class="result-row">
								<span
									>{#if index === 0}<CheckIcon class="size-3.5" />{:else}<CircleIcon
											class="size-3.5"
										/>{/if}<strong>{row.title}</strong></span
								><span>{row.source}</span><Badge variant={index === 0 ? 'secondary' : 'outline'}
									>{row.status}</Badge
								>
							</div>
						{/each}
					</div>
					<div class="evidence-footer">
						<span><CheckIcon class="size-3.5" />Theme linked to 12 source records</span><strong
							>Every claim stays inspectable.</strong
						>
					</div>
				</div>
			</div>

			{#each annotations as annotation, index (annotation.label)}
				<span class={`spotlight-pin pin-${index + 1}`} aria-hidden="true">{annotation.label}</span>
			{/each}
		</div>

		<div class="annotation-ledger">
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
	</div>
</section>

<style>
	.spotlight-header {
		display: grid;
		gap: 2rem;
		align-items: end;
	}
	.spotlight-header h2 {
		max-width: 42rem;
		margin-top: 1.25rem;
		font-size: clamp(2.25rem, 5vw, 3.75rem);
		font-weight: 650;
		line-height: 0.98;
		letter-spacing: -0.05em;
		text-wrap: balance;
	}
	.spotlight-header > div:last-child > p {
		max-width: 34rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}
	.spotlight-stage {
		position: relative;
		margin-top: 3rem;
		border: 1px solid var(--border);
		border-radius: 1rem 1rem 0 0;
		background: var(--muted);
		padding: clamp(1rem, 5vw, 4rem);
	}
	.spotlight-window {
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		background: var(--background);
		box-shadow: 0 24px 60px color-mix(in oklch, var(--foreground) 10%, transparent);
	}
	.window-topbar {
		display: grid;
		min-height: 3rem;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		border-bottom: 1px solid var(--border);
		padding: 0 1rem;
	}
	.window-topbar > div {
		display: flex;
		gap: 0.3rem;
	}
	.window-topbar > div span {
		display: block;
		size: 0.45rem;
		border-radius: 999px;
		background: var(--muted-foreground);
		opacity: 0.35;
	}
	.window-topbar p,
	.window-topbar small {
		font-size: 0.68rem;
		color: var(--muted-foreground);
	}
	.window-topbar small {
		justify-self: end;
	}
	.window-content {
		padding: clamp(1rem, 4vw, 2rem);
	}
	.content-heading,
	.evidence-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.content-heading p {
		font-size: 0.68rem;
		color: var(--muted-foreground);
	}
	.content-heading h3 {
		margin-top: 0.25rem;
		font-size: 1.2rem;
		font-weight: 650;
		letter-spacing: -0.025em;
	}
	.search-row {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		margin-top: 1.5rem;
		border-bottom: 1px solid var(--foreground);
		padding: 0.8rem 0;
		font-size: 0.82rem;
	}
	.search-row > span {
		min-width: 0;
		flex: 1;
	}
	.search-row kbd {
		font-size: 0.65rem;
		color: var(--muted-foreground);
	}
	.filter-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1rem;
	}
	.result-table {
		margin-top: 1.5rem;
		border-top: 1px solid var(--border);
	}
	.result-header,
	.result-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 6rem 5rem;
		align-items: center;
		gap: 0.75rem;
		min-height: 3.5rem;
		border-bottom: 1px solid var(--border);
		padding: 0 0.75rem;
	}
	.result-header {
		background: var(--muted);
		font-size: 0.68rem;
		font-weight: 650;
		color: var(--muted-foreground);
	}
	.result-row {
		font-size: 0.72rem;
	}
	.result-row > span:first-child {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 0.55rem;
	}
	.result-row > span:first-child :global(svg) {
		flex: none;
		color: var(--primary);
	}
	.result-row strong {
		overflow: hidden;
		font-weight: 650;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.result-row > span:nth-child(2) {
		color: var(--muted-foreground);
	}
	.evidence-footer {
		padding-top: 1.25rem;
		font-size: 0.68rem;
	}
	.evidence-footer span {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--primary);
	}
	.evidence-footer strong {
		font-weight: 650;
	}
	.spotlight-pin {
		position: absolute;
		display: none;
		size: 2rem;
		place-items: center;
		border: 2px solid var(--background);
		border-radius: 999px;
		background: var(--primary);
		color: var(--primary-foreground);
		box-shadow: 0 0 0 1px var(--primary);
		font-size: 0.65rem;
		font-weight: 700;
	}
	.pin-1 {
		top: 25%;
		left: 34%;
	}
	.pin-2 {
		top: 54%;
		right: 18%;
	}
	.pin-3 {
		right: 9%;
		bottom: 15%;
	}
	.annotation-ledger {
		display: grid;
		overflow: hidden;
		border: 1px solid var(--border);
		border-top: 0;
		border-radius: 0 0 1rem 1rem;
	}
	.annotation-ledger article {
		display: grid;
		grid-template-columns: 2rem minmax(0, 1fr);
		gap: 0.75rem;
		padding: 1.5rem;
	}
	.annotation-ledger article:not(:last-child) {
		border-bottom: 1px solid var(--border);
	}
	.annotation-ledger article > span {
		font-size: 0.68rem;
		font-weight: 650;
		color: var(--primary);
	}
	.annotation-ledger h3 {
		font-size: 0.9rem;
		font-weight: 650;
	}
	.annotation-ledger p {
		margin-top: 0.4rem;
		font-size: 0.78rem;
		line-height: 1.6;
		color: var(--muted-foreground);
	}
	@media (min-width: 800px) {
		.spotlight-header {
			grid-template-columns: 1fr 0.72fr;
		}
		.spotlight-pin {
			display: grid;
		}
		.annotation-ledger {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
		.annotation-ledger article:not(:last-child) {
			border-right: 1px solid var(--border);
			border-bottom: 0;
		}
	}
	@media (max-width: 560px) {
		.window-topbar small,
		.result-header span:nth-child(2),
		.result-row > span:nth-child(2) {
			display: none;
		}
		.result-header,
		.result-row {
			grid-template-columns: minmax(0, 1fr) 4.5rem;
		}
		.evidence-footer {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
