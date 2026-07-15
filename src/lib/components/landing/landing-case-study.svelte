<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import QuoteIcon from '@lucide/svelte/icons/quote';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Avatar from '$lib/components/ui/avatar';

	interface CaseStudyMetric {
		value: string;
		label: string;
	}

	interface CaseStudyPerson {
		name: string;
		role: string;
		avatar?: string;
	}

	interface Props {
		kicker?: string;
		company?: string;
		quote?: string;
		person?: CaseStudyPerson;
		metrics?: readonly CaseStudyMetric[];
		challenge?: string;
		approach?: string;
		outcomes?: readonly string[];
		ctaLabel?: string;
		ctaHref?: string;
	}

	let {
		kicker = 'Customer story',
		company = 'Northstar',
		quote = 'We stopped asking where work stood. The team and our customers could finally see the same story without another status meeting.',
		person = { name: 'Amelia Hart', role: 'VP of Customer Experience' },
		metrics = [
			{ value: '11 hrs', label: 'saved each week' },
			{ value: '2.4×', label: 'faster follow-through' },
			{ value: '94%', label: 'requests closed on time' }
		],
		challenge = 'Northstar had customer commitments spread across call notes, project tools, and individual inboxes. Account owners spent every Friday rebuilding the same picture.',
		approach = 'They created one intake path, assigned every commitment an owner, and automated updates back to the customer when the work changed state.',
		outcomes = [
			'Weekly account reviews now begin with a prepared brief.',
			'Product decisions stay connected to the customer evidence behind them.',
			'Customers receive progress updates without asking for them.'
		],
		ctaLabel = 'Read the full story',
		ctaHref = '#'
	}: Props = $props();
</script>

<section class="border-b py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="case-study-shell">
			<div class="case-quote">
				<div class="flex items-center justify-between gap-4">
					<Badge variant="secondary">{kicker}</Badge>
					<span
						class="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground"
					>
						<QuoteIcon class="size-4" />
					</span>
				</div>

				<p class="company-wordmark">{company}</p>
				<blockquote>“{quote}”</blockquote>

				<div class="person-row">
					<Avatar.Root class="size-11">
						{#if person.avatar}
							<Avatar.Image src={person.avatar} alt={person.name} />
						{/if}
						<Avatar.Fallback
							>{person.name
								.split(' ')
								.map((part) => part[0])
								.join('')}</Avatar.Fallback
						>
					</Avatar.Root>
					<div>
						<p>{person.name}</p>
						<span>{person.role}</span>
					</div>
				</div>
			</div>

			<div class="case-detail">
				<div class="case-intro">
					<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">The shift</p>
					<h2>From manual follow-up to a shared customer operating rhythm.</h2>
				</div>

				<div class="case-narrative">
					<article>
						<span>Challenge</span>
						<p>{challenge}</p>
					</article>
					<article>
						<span>Approach</span>
						<p>{approach}</p>
					</article>
				</div>

				<ul>
					{#each outcomes as outcome (outcome)}
						<li>
							<span><CheckIcon class="size-3.5" /></span>
							{outcome}
						</li>
					{/each}
				</ul>

				<Button href={ctaHref} variant="outline" class="mt-7">
					{ctaLabel}
					<ArrowRightIcon data-icon="inline-end" />
				</Button>
			</div>

			<div class="case-metrics">
				{#each metrics as metric (metric.label)}
					<div>
						<strong>{metric.value}</strong>
						<span>{metric.label}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.case-study-shell {
		display: grid;
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
	}

	.case-quote,
	.case-detail {
		padding: clamp(1.5rem, 5vw, 3.5rem);
	}

	.case-quote {
		background: var(--foreground);
		color: var(--background);
	}

	.company-wordmark {
		margin-top: clamp(3rem, 8vw, 6rem);
		font-size: 0.85rem;
		font-weight: 750;
		letter-spacing: -0.02em;
	}

	.case-quote blockquote {
		max-width: 38rem;
		margin-top: 1.25rem;
		font-size: clamp(1.75rem, 4vw, 2.75rem);
		font-weight: 600;
		line-height: 1.14;
		letter-spacing: -0.035em;
		text-wrap: balance;
	}

	.person-row {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		margin-top: 2.5rem;
	}

	.person-row p {
		font-size: 0.85rem;
		font-weight: 650;
	}

	.person-row span {
		display: block;
		margin-top: 0.2rem;
		font-size: 0.75rem;
		opacity: 0.65;
	}

	.case-intro h2 {
		max-width: 36rem;
		margin-top: 0.75rem;
		font-size: clamp(1.9rem, 4vw, 2.75rem);
		font-weight: 650;
		line-height: 1.08;
		letter-spacing: -0.035em;
		text-wrap: balance;
	}

	.case-narrative {
		display: grid;
		gap: 1.25rem;
		margin-top: 2.5rem;
	}

	.case-narrative article {
		display: grid;
		grid-template-columns: 5rem minmax(0, 1fr);
		gap: 1rem;
		border-top: 1px solid var(--border);
		padding-top: 1.25rem;
	}

	.case-narrative span {
		font-size: 0.72rem;
		font-weight: 650;
		color: var(--muted-foreground);
	}

	.case-narrative p {
		color: var(--muted-foreground);
		font-size: 0.875rem;
		line-height: 1.7;
	}

	.case-detail ul {
		display: grid;
		gap: 0.75rem;
		margin-top: 2rem;
	}

	.case-detail li {
		display: flex;
		align-items: flex-start;
		gap: 0.7rem;
		font-size: 0.875rem;
		line-height: 1.55;
	}

	.case-detail li > span {
		display: grid;
		size: 1.35rem;
		flex: none;
		place-items: center;
		border-radius: 999px;
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.case-metrics {
		display: grid;
		grid-column: 1 / -1;
		border-top: 1px solid var(--border);
		background: var(--muted);
	}

	.case-metrics div {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.25rem 1.5rem;
	}

	.case-metrics div:not(:last-child) {
		border-bottom: 1px solid var(--border);
	}

	.case-metrics strong {
		font-size: 1.35rem;
		font-weight: 700;
		letter-spacing: -0.03em;
	}

	.case-metrics span {
		font-size: 0.75rem;
		color: var(--muted-foreground);
	}

	@media (min-width: 900px) {
		.case-study-shell {
			grid-template-columns: 1fr 1fr;
		}

		.case-metrics {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.case-metrics div:not(:last-child) {
			border-right: 1px solid var(--border);
			border-bottom: 0;
		}
	}
</style>
