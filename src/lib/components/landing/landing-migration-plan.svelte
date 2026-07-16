<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	interface MigrationStep {
		day: string;
		title: string;
		description: string;
		owner: string;
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		steps?: readonly MigrationStep[];
		included?: readonly string[];
		ctaLabel?: string;
		ctaHref?: string;
		secondaryLabel?: string;
		secondaryHref?: string;
	}

	let {
		kicker = 'A controlled move, not a leap',
		title = 'Start with one workflow. Keep the old path until the new one proves itself.',
		description = 'A migration close should make the sequence and the escape hatch obvious. This plan keeps ownership visible without burying the buyer in a project plan.',
		steps = [
			{
				day: 'Day 0',
				title: 'Map',
				description: 'Capture the sources, owners, permissions, and reports that cannot break.',
				owner: '60-minute working session'
			},
			{
				day: 'Day 3',
				title: 'Prove',
				description: 'Run a sample import and compare the result before anyone changes tools.',
				owner: 'Your lead plus our migration owner'
			},
			{
				day: 'Day 7',
				title: 'Switch',
				description:
					'Move the live workflow, monitor the first week, and retain a rollback export.',
				owner: 'Priority launch support'
			}
		],
		included = [
			'Dedicated migration owner',
			'Historical data import',
			'Team onboarding session',
			'30-day rollback export'
		],
		ctaLabel = 'Plan my migration',
		ctaHref = '/auth/sign-up',
		secondaryLabel = 'Read the migration guide',
		secondaryHref = '#'
	}: Props = $props();
</script>

<section class="border-b bg-muted/25 py-20 sm:py-24" data-testid="migration-plan">
	<div class="mx-auto max-w-7xl px-6">
		<header class="migration-header">
			<div>
				<Badge variant="outline"><ShieldCheckIcon />{kicker}</Badge>
				<h2>{title}</h2>
			</div>
			<p>{description}</p>
		</header>

		<div class="migration-board">
			<div class="board-topline">
				<div>
					<span>Pilot scope</span>
					<strong>One live workflow</strong>
				</div>
				<div class="rollback-note">
					<RotateCcwIcon class="size-4" />
					<span>30-day rollback export included</span>
				</div>
			</div>

			<div class="migration-phases">
				{#each steps as step, index (step.day)}
					<article>
						<div class="phase-heading">
							<span>{step.day}</span>
							<strong>{String(index + 1).padStart(2, '0')}</strong>
						</div>
						<h3>{step.title}</h3>
						<p>{step.description}</p>
						<small>{step.owner}</small>
					</article>
				{/each}
			</div>

			<div class="migration-footer">
				<ul aria-label="Migration support included">
					{#each included as item (item)}
						<li><CheckIcon class="size-3.5" />{item}</li>
					{/each}
				</ul>
				<div class="migration-actions">
					<Button href={secondaryHref} variant="ghost">{secondaryLabel}</Button>
					<Button href={ctaHref}>{ctaLabel}<ArrowRightIcon data-icon="inline-end" /></Button>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.migration-header {
		display: grid;
		gap: 2rem;
		align-items: end;
	}

	.migration-header h2 {
		max-width: 50rem;
		margin-top: 1.25rem;
		font-size: clamp(2.25rem, 5vw, 3.75rem);
		font-weight: 650;
		line-height: 0.98;
		letter-spacing: -0.05em;
		text-wrap: balance;
	}

	.migration-header > p {
		max-width: 34rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}

	.migration-board {
		overflow: hidden;
		margin-top: 3rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--background);
	}

	.board-topline,
	.migration-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		padding: 1.25rem clamp(1.25rem, 4vw, 2.5rem);
	}

	.board-topline {
		border-bottom: 1px solid var(--border);
	}

	.board-topline span,
	.board-topline strong {
		display: block;
	}

	.board-topline > div:first-child span {
		color: var(--muted-foreground);
		font-size: 0.68rem;
		font-weight: 650;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.board-topline > div:first-child strong {
		margin-top: 0.2rem;
		font-size: 0.9rem;
	}

	.rollback-note {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--primary);
		font-size: 0.75rem;
		font-weight: 650;
	}

	.migration-phases {
		display: grid;
	}

	.migration-phases article {
		position: relative;
		display: flex;
		min-height: 22rem;
		flex-direction: column;
		padding: clamp(1.5rem, 4vw, 2.5rem);
	}

	.migration-phases article::before {
		position: absolute;
		top: 0;
		right: clamp(1.5rem, 4vw, 2.5rem);
		left: clamp(1.5rem, 4vw, 2.5rem);
		height: 3px;
		border-radius: 999px;
		background: var(--border);
		content: '';
	}

	.migration-phases article:first-child::before {
		background: var(--primary);
	}

	.phase-heading {
		display: flex;
		align-items: start;
		justify-content: space-between;
		gap: 1rem;
	}

	.phase-heading span {
		padding-top: 0.4rem;
		color: var(--primary);
		font-size: 0.72rem;
		font-weight: 650;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.phase-heading strong {
		color: var(--muted);
		font-size: 3.5rem;
		font-weight: 700;
		line-height: 0.8;
		letter-spacing: -0.08em;
	}

	.migration-phases h3 {
		margin-top: 3rem;
		font-size: clamp(1.8rem, 3vw, 2.5rem);
		font-weight: 650;
		line-height: 1;
		letter-spacing: -0.04em;
	}

	.migration-phases p {
		max-width: 28rem;
		margin-top: 1rem;
		color: var(--muted-foreground);
		font-size: 0.875rem;
		line-height: 1.7;
	}

	.migration-phases small {
		margin-top: auto;
		padding-top: 2rem;
		font-size: 0.72rem;
		font-weight: 650;
	}

	.migration-footer {
		border-top: 1px solid var(--border);
		background: var(--muted);
	}

	.migration-footer ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem 1.25rem;
	}

	.migration-footer li {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.72rem;
		font-weight: 600;
	}

	.migration-footer li :global(svg) {
		color: var(--primary);
	}

	.migration-actions {
		display: flex;
		flex: none;
		gap: 0.5rem;
	}

	@media (min-width: 900px) {
		.migration-header {
			grid-template-columns: 1fr 0.72fr;
		}

		.migration-phases {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.migration-phases article:not(:last-child) {
			border-right: 1px solid var(--border);
		}
	}

	@media (max-width: 760px) {
		.board-topline,
		.migration-footer,
		.migration-actions {
			align-items: stretch;
			flex-direction: column;
		}

		.migration-phases article {
			min-height: 18rem;
			border-bottom: 1px solid var(--border);
		}

		.migration-phases article:last-child {
			border-bottom: 0;
		}

		.migration-actions :global(a) {
			width: 100%;
		}
	}
</style>
