<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import MoveRightIcon from '@lucide/svelte/icons/move-right';
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
		kicker = 'A migration plan, not a leap of faith',
		title = 'Move the workflow without putting the work at risk.',
		description = 'Close with a concrete transition plan when switching cost is the last objection. Show ownership, sequence, and the safety net.',
		steps = [
			{
				day: 'Day 0',
				title: 'Map the current workflow',
				description: 'We document sources, owners, states, and the reports your team depends on.',
				owner: '60-minute working session'
			},
			{
				day: 'Day 3',
				title: 'Import and verify',
				description:
					'Run a test import, compare record counts, and resolve exceptions before anything changes.',
				owner: 'Handled with your project lead'
			},
			{
				day: 'Day 7',
				title: 'Switch with a rollback window',
				description:
					'Launch the new path, monitor the first week, and keep the prior export available.',
				owner: 'Priority launch support'
			}
		],
		included = [
			'Dedicated migration owner',
			'Historical data import',
			'Workflow and permission setup',
			'Team onboarding session',
			'30-day rollback export',
			'Post-launch health review'
		],
		ctaLabel = 'Plan my migration',
		ctaHref = '/auth/sign-up',
		secondaryLabel = 'Read the migration guide',
		secondaryHref = '#'
	}: Props = $props();
</script>

<section class="border-b bg-muted/25 py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="migration-shell">
			<div class="migration-main">
				<Badge variant="outline">
					<MoveRightIcon />
					{kicker}
				</Badge>
				<h2>{title}</h2>
				<p class="migration-description">{description}</p>

				<div class="migration-timeline">
					{#each steps as step, index (step.day)}
						<article>
							<div class="timeline-rail">
								<span class:current={index === 0}>{String(index + 1).padStart(2, '0')}</span>
							</div>
							<div class="timeline-copy">
								<p>{step.day}</p>
								<h3>{step.title}</h3>
								<span>{step.description}</span>
								<small>{step.owner}</small>
							</div>
						</article>
					{/each}
				</div>
			</div>

			<aside class="migration-summary">
				<div class="summary-heading">
					<span
						class="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground"
					>
						<ShieldCheckIcon class="size-4" />
					</span>
					<div>
						<p>Launch support</p>
						<h3>Everything needed to switch safely.</h3>
					</div>
				</div>

				<ul>
					{#each included as item (item)}
						<li><CheckIcon class="size-4 text-primary" />{item}</li>
					{/each}
				</ul>

				<div class="summary-note">
					<p>Start with one workflow</p>
					<span>You can prove the path before moving the rest of the team.</span>
				</div>

				<div class="mt-6 grid gap-2">
					<Button href={ctaHref} size="lg">
						{ctaLabel}
						<ArrowRightIcon data-icon="inline-end" />
					</Button>
					<Button href={secondaryHref} variant="ghost">{secondaryLabel}</Button>
				</div>
			</aside>
		</div>
	</div>
</section>

<style>
	.migration-shell {
		display: grid;
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--background);
	}

	.migration-main {
		padding: clamp(1.5rem, 5vw, 3.5rem);
	}

	.migration-main > h2 {
		max-width: 44rem;
		margin-top: 1.5rem;
		font-size: clamp(2.25rem, 5vw, 4rem);
		font-weight: 650;
		line-height: 0.98;
		letter-spacing: -0.05em;
		text-wrap: balance;
	}

	.migration-description {
		max-width: 40rem;
		margin-top: 1.25rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}

	.migration-timeline {
		display: grid;
		margin-top: 3rem;
	}

	.migration-timeline article {
		display: grid;
		grid-template-columns: 2.5rem minmax(0, 1fr);
		gap: 1rem;
	}

	.timeline-rail {
		position: relative;
		display: flex;
		justify-content: center;
	}

	.timeline-rail::after {
		position: absolute;
		top: 2.5rem;
		bottom: 0;
		left: 50%;
		width: 1px;
		background: var(--border);
		content: '';
	}

	.migration-timeline article:last-child .timeline-rail::after {
		display: none;
	}

	.timeline-rail span {
		display: grid;
		size: 2rem;
		place-items: center;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--background);
		font-size: 0.68rem;
		font-weight: 700;
		color: var(--muted-foreground);
	}

	.timeline-rail span.current {
		border-color: var(--primary);
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.timeline-copy {
		padding-bottom: 2.25rem;
	}

	.timeline-copy > p {
		font-size: 0.7rem;
		font-weight: 650;
		color: var(--primary);
		text-transform: uppercase;
	}

	.timeline-copy h3 {
		margin-top: 0.35rem;
		font-size: 1.05rem;
		font-weight: 650;
	}

	.timeline-copy > span {
		display: block;
		max-width: 38rem;
		margin-top: 0.5rem;
		color: var(--muted-foreground);
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.timeline-copy small {
		display: inline-block;
		margin-top: 0.8rem;
		border-radius: 999px;
		background: var(--muted);
		padding: 0.35rem 0.6rem;
		font-size: 0.68rem;
		font-weight: 600;
		color: var(--muted-foreground);
	}

	.migration-summary {
		display: flex;
		justify-content: center;
		flex-direction: column;
		border-top: 1px solid var(--border);
		background: var(--card);
		padding: clamp(1.5rem, 5vw, 3rem);
	}

	.summary-heading {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.summary-heading p {
		font-size: 0.7rem;
		font-weight: 650;
		color: var(--muted-foreground);
		text-transform: uppercase;
	}

	.summary-heading h3 {
		max-width: 22rem;
		margin-top: 0.3rem;
		font-size: 1.25rem;
		font-weight: 650;
		line-height: 1.2;
	}

	.migration-summary ul {
		display: grid;
		gap: 0;
		margin-top: 2rem;
		border-block: 1px solid var(--border);
	}

	.migration-summary li {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		border-bottom: 1px solid var(--border);
		padding: 0.8rem 0;
		font-size: 0.8rem;
		font-weight: 550;
	}

	.migration-summary li:last-child {
		border-bottom: 0;
	}

	.summary-note {
		margin-top: 1.5rem;
		border-radius: 0.75rem;
		background: var(--muted);
		padding: 1rem;
	}

	.summary-note p {
		font-size: 0.82rem;
		font-weight: 650;
	}

	.summary-note span {
		display: block;
		margin-top: 0.35rem;
		color: var(--muted-foreground);
		font-size: 0.75rem;
		line-height: 1.55;
	}

	@media (min-width: 900px) {
		.migration-shell {
			grid-template-columns: minmax(0, 1.2fr) minmax(21rem, 0.8fr);
		}

		.migration-summary {
			border-top: 0;
			border-left: 1px solid var(--border);
		}
	}
</style>
