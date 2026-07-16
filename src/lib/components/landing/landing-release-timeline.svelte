<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import GitCommitIcon from '@lucide/svelte/icons/git-commit-horizontal';
	import RocketIcon from '@lucide/svelte/icons/rocket';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	interface ReleaseEntry {
		version: string;
		date: string;
		title: string;
		description: string;
		changes: readonly string[];
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		releases?: readonly ReleaseEntry[];
		ctaLabel?: string;
		ctaHref?: string;
	}

	let {
		kicker = 'Shipping momentum',
		title = 'Turn the changelog into a visible release rhythm.',
		description = 'A release-led proof section should feel like a product train moving through time, not a blog archive with dots down the side.',
		releases = [
			{
				version: '2.8',
				date: 'July 2026',
				title: 'Customer briefs',
				description:
					'A prepared account summary that gathers open work, risks, and recent decisions before every review.',
				changes: ['Scheduled delivery', 'Source-linked summaries', 'Workspace templates']
			},
			{
				version: '2.7',
				date: 'June 2026',
				title: 'Workflow conditions',
				description:
					'Route work using account, owner, plan, and request metadata without writing custom rules.',
				changes: ['Visual rule builder', 'Dry-run preview', 'Change history']
			},
			{
				version: '2.6',
				date: 'May 2026',
				title: 'Shared customer views',
				description:
					'Publish a focused progress view for customers while keeping internal context private.',
				changes: ['Custom domains', 'Viewer permissions', 'Update subscriptions']
			}
		],
		ctaLabel = 'Browse the changelog',
		ctaHref = '/changelog'
	}: Props = $props();
</script>

<section class="border-b py-20 sm:py-24" data-testid="release-timeline">
	<div class="mx-auto max-w-7xl px-6">
		<div class="release-heading">
			<div>
				<Badge variant="outline"><GitCommitIcon />{kicker}</Badge>
				<h2>{title}</h2>
			</div>
			<div>
				<p>{description}</p>
				<Button href={ctaHref} variant="outline" class="mt-6">
					{ctaLabel}<ArrowRightIcon data-icon="inline-end" />
				</Button>
			</div>
		</div>

		<div class="release-train mt-12">
			<header class="train-rail" aria-label="Release sequence">
				{#each releases as release, index (release.version)}
					<div class:current={index === 0}>
						<span class="rail-stop"
							><i></i>{index === 0 ? 'Current' : release.date.split(' ')[0]}</span
						>
						<strong>v{release.version}</strong>
						<small>{release.date}</small>
					</div>
				{/each}
			</header>

			<div class="release-cars">
				{#each releases as release, index (release.version)}
					<article class:lead-release={index === 0}>
						<div class="release-index">{String(index + 1).padStart(2, '0')}</div>
						<div class="release-label">
							{#if index === 0}<RocketIcon class="size-4" />{/if}
							<span>{index === 0 ? 'Latest release' : 'Previously shipped'}</span>
						</div>
						<h3>{release.title}</h3>
						<p>{release.description}</p>

						{#if index === 0}
							<div class="release-artifact">
								<div class="artifact-bar">
									<div><span>Account brief</span><strong>Northstar Labs</strong></div>
									<Badge variant="outline">Ready</Badge>
								</div>
								<div class="artifact-body">
									<div class="artifact-summary">
										<span>Open commitments</span><strong>7</strong>
									</div>
									<div class="artifact-summary">
										<span>Needs attention</span><strong>2</strong>
									</div>
									<div class="artifact-note">
										<CheckIcon class="size-3.5" />Prepared automatically at 08:55
									</div>
								</div>
							</div>
						{/if}

						<ul>
							{#each release.changes as change (change)}
								<li><CheckIcon class="size-3.5" />{change}</li>
							{/each}
						</ul>
					</article>
				{/each}
			</div>

			<footer class="train-footer">
				<div><span class="pulse-dot"></span>Shipping every month</div>
				<span>{releases.length} releases / 90 days</span>
			</footer>
		</div>
	</div>
</section>

<style>
	.release-heading {
		display: grid;
		gap: 2rem;
		align-items: end;
	}
	.release-heading h2 {
		max-width: 47rem;
		margin-top: 1.25rem;
		font-size: clamp(2.25rem, 5vw, 4rem);
		font-weight: 650;
		line-height: 0.98;
		letter-spacing: -0.05em;
		text-wrap: balance;
	}
	.release-heading > div:last-child > p {
		max-width: 34rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}
	.release-train {
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
	}
	.train-rail,
	.release-cars {
		display: grid;
	}
	.train-rail {
		position: relative;
		background: var(--muted);
	}
	.train-rail > div {
		position: relative;
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.25rem 0.75rem;
		border-bottom: 1px solid var(--border);
		padding: 1rem 1.25rem;
	}
	.train-rail strong {
		font-size: 0.75rem;
	}
	.train-rail small {
		grid-column: 2;
		grid-row: 1 / 3;
		align-self: center;
		font-size: 0.68rem;
		color: var(--muted-foreground);
	}
	.rail-stop {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		font-size: 0.65rem;
		font-weight: 700;
		color: var(--muted-foreground);
		text-transform: uppercase;
	}
	.rail-stop i,
	.pulse-dot {
		display: block;
		size: 0.42rem;
		border-radius: 999px;
		background: currentColor;
	}
	.train-rail .current {
		color: var(--primary);
	}
	.train-rail .current .rail-stop {
		color: var(--primary);
	}
	.release-cars article {
		position: relative;
		min-width: 0;
		padding: clamp(1.5rem, 3vw, 2.5rem);
	}
	.release-cars article:not(:last-child) {
		border-bottom: 1px solid var(--border);
	}
	.release-cars .lead-release {
		background: var(--foreground);
		color: var(--background);
	}
	.release-index {
		position: absolute;
		top: 1rem;
		right: 1.25rem;
		font-size: clamp(3.5rem, 7vw, 6rem);
		font-weight: 700;
		line-height: 1;
		opacity: 0.05;
	}
	.release-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--primary);
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.release-cars h3 {
		position: relative;
		max-width: 24rem;
		margin-top: 1.5rem;
		font-size: clamp(1.65rem, 3vw, 2.75rem);
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.04em;
	}
	.release-cars article:not(.lead-release) h3 {
		font-size: clamp(1.4rem, 2.4vw, 2rem);
	}
	.release-cars article > p {
		max-width: 34rem;
		margin-top: 0.85rem;
		font-size: 0.8rem;
		line-height: 1.65;
		opacity: 0.6;
	}
	.release-artifact {
		overflow: hidden;
		margin-top: 2rem;
		border: 1px solid color-mix(in oklch, var(--background) 18%, transparent);
		border-radius: 0.75rem;
		background: color-mix(in oklch, var(--background) 5%, transparent);
	}
	.artifact-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid color-mix(in oklch, var(--background) 14%, transparent);
		padding: 0.85rem 1rem;
	}
	.artifact-bar span,
	.artifact-bar strong {
		display: block;
		font-size: 0.68rem;
	}
	.artifact-bar strong {
		margin-top: 0.15rem;
	}
	.artifact-body {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.artifact-summary {
		padding: 1rem;
	}
	.artifact-summary + .artifact-summary {
		border-left: 1px solid color-mix(in oklch, var(--background) 14%, transparent);
	}
	.artifact-summary span,
	.artifact-summary strong {
		display: block;
	}
	.artifact-summary span {
		font-size: 0.65rem;
		opacity: 0.55;
	}
	.artifact-summary strong {
		margin-top: 0.35rem;
		font-size: 1.5rem;
	}
	.artifact-note {
		display: flex;
		grid-column: 1 / -1;
		align-items: center;
		gap: 0.5rem;
		border-top: 1px solid color-mix(in oklch, var(--background) 14%, transparent);
		padding: 0.75rem 1rem;
		color: var(--primary);
		font-size: 0.66rem;
		font-weight: 650;
	}
	.release-cars ul {
		display: grid;
		gap: 0.65rem;
		margin-top: 1.5rem;
	}
	.release-cars li {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		font-size: 0.7rem;
		font-weight: 600;
	}
	:global(.release-cars li > svg) {
		color: var(--primary);
	}
	.train-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-top: 1px solid var(--border);
		padding: 0.9rem 1.25rem;
		font-size: 0.68rem;
		color: var(--muted-foreground);
	}
	.train-footer > div {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 650;
		color: var(--foreground);
	}
	.pulse-dot {
		color: var(--primary);
		box-shadow: 0 0 0 0.3rem color-mix(in oklch, var(--primary) 12%, transparent);
	}
	@media (min-width: 768px) {
		.release-heading {
			grid-template-columns: 1.25fr 0.75fr;
		}
		.train-rail,
		.release-cars {
			grid-template-columns: 1.35fr repeat(2, minmax(0, 0.825fr));
		}
		.train-rail > div {
			border-right: 1px solid var(--border);
			border-bottom: 0;
		}
		.train-rail > div:last-child {
			border-right: 0;
		}
		.release-cars article:not(:last-child) {
			border-right: 1px solid var(--border);
			border-bottom: 0;
		}
	}
	@media (max-width: 639px) {
		.train-footer {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
