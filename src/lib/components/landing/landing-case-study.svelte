<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ClockIcon from '@lucide/svelte/icons/clock-3';
	import QuoteIcon from '@lucide/svelte/icons/quote';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
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
		kicker = 'Customer field report',
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

	const initials = $derived(
		person.name
			.split(' ')
			.map((part) => part[0])
			.join('')
	);
</script>

<section class="border-b py-20 sm:py-24" data-testid="case-study">
	<div class="mx-auto max-w-7xl px-6">
		<div class="case-heading">
			<div>
				<Badge variant="outline"><QuoteIcon />{kicker}</Badge>
				<h2>Show the week that changed, not another floating testimonial.</h2>
			</div>
			<p>
				A customer story becomes credible when the quote, the operating change, and the evidence
				live on the same page.
			</p>
		</div>

		<article class="field-report mt-12">
			<header class="report-bar">
				<div>
					<span class="report-mark">N</span>
					<div>
						<strong>{company}</strong>
						<span>Customer operations / Field report 04</span>
					</div>
				</div>
				<Badge variant="secondary">Verified outcome</Badge>
			</header>

			<div class="report-quote">
				<QuoteIcon class="quote-mark" />
				<blockquote>“{quote}”</blockquote>
				<div class="person-row">
					<Avatar.Root class="size-11">
						{#if person.avatar}
							<Avatar.Image src={person.avatar} alt={person.name} />
						{/if}
						<Avatar.Fallback>{initials}</Avatar.Fallback>
					</Avatar.Root>
					<div>
						<strong>{person.name}</strong>
						<span>{person.role}</span>
					</div>
				</div>
			</div>

			<div class="report-evidence">
				<div class="shift-notes">
					<p class="eyebrow">The operating change</p>
					<dl>
						<div>
							<dt>Before</dt>
							<dd>{challenge}</dd>
						</div>
						<div>
							<dt>After</dt>
							<dd>{approach}</dd>
						</div>
					</dl>
				</div>

				<div class="friday-proof" aria-label="Friday account review before and after">
					<div class="proof-title">
						<div>
							<ClockIcon class="size-4" />
							<strong>Friday account review</strong>
						</div>
						<span>Week 28</span>
					</div>
					<div class="schedule-row old">
						<span>08:30</span>
						<div><strong>Rebuild account status</strong><small>4 owners / 6 sources</small></div>
						<em>2h 15m</em>
					</div>
					<div class="schedule-row now">
						<span>08:55</span>
						<div>
							<strong>Prepared brief arrives</strong><small>Open work, risks, and decisions</small>
						</div>
						<em>Auto</em>
					</div>
					<div class="schedule-row meeting">
						<span>09:00</span>
						<div>
							<strong>Review decisions</strong><small>The meeting starts with the work</small>
						</div>
						<CheckIcon class="size-4 text-primary" />
					</div>
				</div>
			</div>

			<div class="report-outcomes">
				<div class="outcome-list">
					<p class="eyebrow">What held after 90 days</p>
					<ul>
						{#each outcomes as outcome, index (outcome)}
							<li><span>{String(index + 1).padStart(2, '0')}</span>{outcome}</li>
						{/each}
					</ul>
				</div>
				<div class="metric-ledger">
					{#each metrics as metric, index (metric.label)}
						<div class:primary-metric={index === 0}>
							<strong>{metric.value}</strong>
							<span>{metric.label}</span>
						</div>
					{/each}
				</div>
			</div>

			<footer class="report-footer">
				<div><SparklesIcon class="size-4 text-primary" />Source-linked customer evidence</div>
				<Button href={ctaHref} variant="ghost">
					{ctaLabel}<ArrowRightIcon data-icon="inline-end" />
				</Button>
			</footer>
		</article>
	</div>
</section>

<style>
	.case-heading {
		display: grid;
		gap: 2rem;
		align-items: end;
	}
	.case-heading h2 {
		max-width: 47rem;
		margin-top: 1.25rem;
		font-size: clamp(2.25rem, 5vw, 4rem);
		font-weight: 650;
		line-height: 0.98;
		letter-spacing: -0.05em;
		text-wrap: balance;
	}
	.case-heading > p {
		max-width: 34rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}
	.field-report {
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
		box-shadow: 0 28px 70px color-mix(in oklch, var(--foreground) 7%, transparent);
	}
	.report-bar,
	.report-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
	}
	.report-bar {
		border-bottom: 1px solid var(--border);
	}
	.report-bar > div,
	.report-bar > div > div,
	.report-footer > div {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.report-bar strong,
	.report-bar span {
		display: block;
	}
	.report-bar strong {
		font-size: 0.82rem;
	}
	.report-bar span:not(.report-mark) {
		margin-top: 0.1rem;
		font-size: 0.68rem;
		color: var(--muted-foreground);
	}
	.report-mark {
		display: grid;
		size: 2.25rem;
		place-items: center;
		border-radius: 0.55rem;
		background: var(--foreground);
		color: var(--background);
		font-weight: 750;
	}
	.report-quote {
		position: relative;
		display: grid;
		gap: 2rem;
		padding: clamp(2rem, 6vw, 5rem);
		background: var(--foreground);
		color: var(--background);
	}
	:global(.quote-mark) {
		position: absolute;
		top: 2rem;
		right: 2rem;
		size: clamp(2.5rem, 6vw, 5rem);
		opacity: 0.08;
	}
	.report-quote blockquote {
		max-width: 63rem;
		font-size: clamp(2rem, 4.7vw, 4.6rem);
		font-weight: 560;
		line-height: 1.02;
		letter-spacing: -0.05em;
		text-wrap: balance;
	}
	.person-row {
		display: flex;
		align-items: center;
		gap: 0.8rem;
	}
	.person-row strong,
	.person-row span {
		display: block;
	}
	.person-row strong {
		font-size: 0.82rem;
	}
	.person-row span {
		margin-top: 0.18rem;
		font-size: 0.72rem;
		opacity: 0.62;
	}
	.report-evidence,
	.report-outcomes {
		display: grid;
	}
	.shift-notes,
	.friday-proof,
	.outcome-list,
	.metric-ledger {
		padding: clamp(1.5rem, 4vw, 3rem);
	}
	.eyebrow {
		font-size: 0.68rem;
		font-weight: 700;
		color: var(--muted-foreground);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.shift-notes dl {
		display: grid;
		gap: 1.5rem;
		margin-top: 2rem;
	}
	.shift-notes dl > div {
		display: grid;
		grid-template-columns: 4rem minmax(0, 1fr);
		gap: 1rem;
		border-top: 1px solid var(--border);
		padding-top: 1rem;
	}
	.shift-notes dt {
		font-size: 0.72rem;
		font-weight: 650;
	}
	.shift-notes dd {
		color: var(--muted-foreground);
		font-size: 0.84rem;
		line-height: 1.65;
	}
	.friday-proof {
		background: var(--muted);
	}
	.proof-title,
	.proof-title > div {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}
	.proof-title strong {
		font-size: 0.82rem;
	}
	.proof-title > span {
		font-size: 0.68rem;
		color: var(--muted-foreground);
	}
	.schedule-row {
		display: grid;
		grid-template-columns: 3rem minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.9rem;
		border-top: 1px solid var(--border);
		padding: 1.15rem 0;
	}
	.schedule-row:first-of-type {
		margin-top: 1.5rem;
	}
	.schedule-row > span,
	.schedule-row small,
	.schedule-row em {
		font-size: 0.68rem;
		color: var(--muted-foreground);
	}
	.schedule-row strong,
	.schedule-row small {
		display: block;
	}
	.schedule-row strong {
		font-size: 0.8rem;
	}
	.schedule-row small {
		margin-top: 0.2rem;
	}
	.schedule-row em {
		font-style: normal;
	}
	.schedule-row.old strong {
		text-decoration: line-through;
		text-decoration-color: var(--destructive);
	}
	.schedule-row.now {
		color: var(--primary);
	}
	.schedule-row.now em {
		border-radius: 999px;
		background: color-mix(in oklch, var(--primary) 15%, transparent);
		padding: 0.25rem 0.5rem;
		color: var(--primary);
		font-weight: 700;
	}
	.report-outcomes {
		border-top: 1px solid var(--border);
	}
	.outcome-list ul {
		display: grid;
		gap: 1rem;
		margin-top: 1.5rem;
	}
	.outcome-list li {
		display: grid;
		grid-template-columns: 2rem minmax(0, 1fr);
		gap: 0.75rem;
		font-size: 0.84rem;
		line-height: 1.55;
	}
	.outcome-list li span {
		color: var(--primary);
		font-size: 0.68rem;
		font-weight: 700;
	}
	.metric-ledger {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-content: center;
		gap: 0;
		background: var(--foreground);
		color: var(--background);
	}
	.metric-ledger > div {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		min-height: 7rem;
		border-top: 1px solid color-mix(in oklch, var(--background) 16%, transparent);
		padding: 1rem 0;
	}
	.metric-ledger > div:nth-child(even) {
		padding-left: 1.25rem;
	}
	.metric-ledger .primary-metric {
		grid-column: 1 / -1;
		border-top: 0;
	}
	.metric-ledger strong,
	.metric-ledger span {
		display: block;
	}
	.metric-ledger strong {
		font-size: clamp(2.2rem, 5vw, 4.5rem);
		font-weight: 600;
		line-height: 0.95;
		letter-spacing: -0.05em;
	}
	.metric-ledger > div:not(.primary-metric) strong {
		font-size: clamp(1.5rem, 3vw, 2.5rem);
	}
	.metric-ledger span {
		margin-top: 0.45rem;
		font-size: 0.68rem;
		opacity: 0.62;
	}
	.report-footer {
		border-top: 1px solid var(--border);
		font-size: 0.72rem;
		font-weight: 600;
	}
	@media (min-width: 768px) {
		.case-heading {
			grid-template-columns: 1.25fr 0.75fr;
		}
		.report-quote {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: end;
		}
		.report-evidence,
		.report-outcomes {
			grid-template-columns: minmax(0, 1.05fr) minmax(22rem, 0.95fr);
		}
		.friday-proof,
		.metric-ledger {
			border-left: 1px solid var(--border);
		}
	}
	@media (max-width: 639px) {
		.report-bar {
			align-items: flex-start;
		}
		.report-bar > div > div > span {
			display: none;
		}
		.report-footer {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
