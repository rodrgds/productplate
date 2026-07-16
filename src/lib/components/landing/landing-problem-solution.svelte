<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	interface ComparisonItem {
		title: string;
		description: string;
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		beforeLabel?: string;
		afterLabel?: string;
		problems?: readonly ComparisonItem[];
		outcomes?: readonly ComparisonItem[];
		ctaLabel?: string;
		ctaHref?: string;
	}

	let {
		kicker = 'A calmer operating model',
		title = 'Show the operating change, row by row.',
		description = 'Instead of two generic before-and-after cards, pair every source of friction with the exact behavior the product changes.',
		beforeLabel = 'How work breaks today',
		afterLabel = 'What replaces it',
		problems = [
			{
				title: 'Requests arrive everywhere',
				description: 'Context is split across inboxes, docs, and chat.'
			},
			{
				title: 'Owners chase updates',
				description: 'Status reporting steals time from the work itself.'
			},
			{
				title: 'Decisions disappear',
				description: 'The team repeats conversations without a durable record.'
			}
		],
		outcomes = [
			{
				title: 'One intake path',
				description: 'Every request arrives with the context and priority it needs.'
			},
			{
				title: 'Progress stays current',
				description: 'Automations update owners and stakeholders as work moves.'
			},
			{
				title: 'A durable decision trail',
				description: 'Rationale stays attached to the work that came from it.'
			}
		],
		ctaLabel = 'See the workflow',
		ctaHref = '#workflow'
	}: Props = $props();

	const transformations = $derived(
		problems.map((problem, index) => ({ problem, outcome: outcomes[index] ?? outcomes[0] }))
	);
</script>

<section class="border-b py-20 sm:py-24" data-testid="problem-solution">
	<div class="mx-auto max-w-7xl px-6">
		<header class="comparison-header">
			<div>
				<Badge variant="outline">{kicker}</Badge>
				<h2>{title}</h2>
			</div>
			<div>
				<p>{description}</p>
				<Button href={ctaHref} variant="link" class="mt-3 px-0">
					{ctaLabel}<ArrowRightIcon data-icon="inline-end" />
				</Button>
			</div>
		</header>

		<div class="transformation-table">
			<div class="table-header" aria-hidden="true">
				<span></span><strong>{beforeLabel}</strong><span></span><strong>{afterLabel}</strong>
			</div>

			{#each transformations as transformation, index (transformation.problem.title)}
				<article>
					<span class="transformation-index">{String(index + 1).padStart(2, '0')}</span>
					<div class="state state-before">
						<span class="state-icon"><XIcon class="size-3.5" /></span>
						<div>
							<h3>{transformation.problem.title}</h3>
							<p>{transformation.problem.description}</p>
						</div>
					</div>
					<div class="transformation-arrow" aria-hidden="true">
						<ArrowRightIcon class="size-4" />
					</div>
					<div class="state state-after">
						<span class="state-icon"><CheckIcon class="size-3.5" /></span>
						<div>
							<h3>{transformation.outcome?.title}</h3>
							<p>{transformation.outcome?.description}</p>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.comparison-header {
		display: grid;
		gap: 2rem;
		align-items: end;
	}

	.comparison-header h2 {
		max-width: 42rem;
		margin-top: 1.25rem;
		font-size: clamp(2.25rem, 5vw, 3.75rem);
		font-weight: 650;
		line-height: 0.98;
		letter-spacing: -0.05em;
		text-wrap: balance;
	}

	.comparison-header > div:last-child > p {
		max-width: 36rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}

	.transformation-table {
		overflow: hidden;
		margin-top: 3rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--background);
	}

	.table-header,
	.transformation-table article {
		display: grid;
		align-items: center;
	}

	.table-header {
		display: none;
		min-height: 3.5rem;
		background: var(--muted);
		font-size: 0.7rem;
		color: var(--muted-foreground);
	}

	.table-header strong {
		font-weight: 650;
	}

	.transformation-table article {
		position: relative;
		gap: 1rem;
		padding: 1.5rem;
		border-top: 1px solid var(--border);
	}

	.transformation-table article:first-of-type {
		border-top: 0;
	}

	.transformation-index {
		font-size: 0.68rem;
		font-weight: 650;
		color: var(--primary);
	}

	.state {
		display: grid;
		grid-template-columns: 1.75rem minmax(0, 1fr);
		gap: 0.75rem;
		align-items: start;
	}

	.state-icon {
		display: grid;
		size: 1.75rem;
		place-items: center;
		border-radius: 999px;
	}

	.state-before .state-icon {
		background: var(--muted);
		color: var(--muted-foreground);
	}

	.state-after .state-icon {
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.state h3 {
		font-size: 0.95rem;
		font-weight: 650;
	}

	.state p {
		max-width: 29rem;
		margin-top: 0.35rem;
		font-size: 0.8rem;
		line-height: 1.6;
		color: var(--muted-foreground);
	}

	.transformation-arrow {
		display: grid;
		size: 2rem;
		place-items: center;
		margin-left: 2.5rem;
		border-radius: 999px;
		background: var(--muted);
		color: var(--primary);
	}

	@media (min-width: 800px) {
		.comparison-header {
			grid-template-columns: 1fr 0.72fr;
		}

		.table-header,
		.transformation-table article {
			grid-template-columns: 3rem minmax(0, 1fr) 4rem minmax(0, 1fr);
		}

		.table-header {
			display: grid;
			padding: 0 1.5rem;
		}

		.transformation-table article:first-of-type {
			border-top: 1px solid var(--border);
		}

		.transformation-arrow {
			margin: 0 auto;
		}
	}
</style>
