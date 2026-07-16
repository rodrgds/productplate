<script lang="ts">
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import FileCheckIcon from '@lucide/svelte/icons/file-check-2';
	import GlobeIcon from '@lucide/svelte/icons/globe-2';
	import LockIcon from '@lucide/svelte/icons/lock-keyhole';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	interface TrustStandard {
		name: string;
		description: string;
		status: string;
	}

	interface TrustCommitment {
		title: string;
		description: string;
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		standards?: readonly TrustStandard[];
		commitments?: readonly TrustCommitment[];
		ctaLabel?: string;
		ctaHref?: string;
	}

	let {
		kicker = 'Trust center',
		title = 'Make the security review feel answered before it starts.',
		description = 'Put concrete controls, policies, and ownership in one visible section. Replace these sample claims with evidence your team can stand behind.',
		standards = [
			{ name: 'SOC 2 Type II', description: 'Independent controls audit', status: 'Available' },
			{ name: 'GDPR', description: 'Data protection terms and DPA', status: 'Ready' },
			{ name: '99.95% uptime', description: 'Published service objective', status: 'Tracked' },
			{ name: 'EU data region', description: 'Regional processing option', status: 'Optional' }
		],
		commitments = [
			{
				title: 'Encryption by default',
				description: 'Data is encrypted in transit and at rest using managed, current standards.'
			},
			{
				title: 'Least-privilege access',
				description:
					'Production access is scoped, reviewed, and recorded for accountable operations.'
			},
			{
				title: 'Customer-owned data',
				description: 'Export and deletion paths are documented before a customer needs them.'
			}
		],
		ctaLabel = 'Visit the trust center',
		ctaHref = '#'
	}: Props = $props();

	const standardIcons = [ShieldCheckIcon, FileCheckIcon, GlobeIcon, LockIcon] as const;
</script>

<section class="border-b bg-muted/25 py-20 sm:py-24" data-testid="trust-center">
	<div class="mx-auto max-w-7xl px-6">
		<div class="trust-heading">
			<div>
				<Badge variant="outline"><ShieldCheckIcon />{kicker}</Badge>
				<h2>{title}</h2>
			</div>
			<div>
				<p>{description}</p>
				<Button href={ctaHref} variant="outline" class="mt-6">
					{ctaLabel}<ArrowUpRightIcon data-icon="inline-end" />
				</Button>
			</div>
		</div>

		<article class="trust-manifest mt-12">
			<header class="manifest-header">
				<div>
					<span class="manifest-icon"><ShieldCheckIcon class="size-5" /></span>
					<div>
						<strong>Security &amp; data manifest</strong>
						<span>Customer-facing evidence index</span>
					</div>
				</div>
				<div class="review-stamp">
					<span><CheckIcon class="size-3.5" />Evidence reviewed</span>
					<small>16 Jul 2026</small>
				</div>
			</header>

			<div class="manifest-body">
				<div class="evidence-index">
					<div class="index-heading">
						<span>Ref.</span><span>Program and evidence</span><span>State</span>
					</div>
					{#each standards as standard, index (standard.name)}
						{@const Icon = standardIcons[index % standardIcons.length]}
						<div class="evidence-row">
							<span class="ref-number">S-{String(index + 1).padStart(2, '0')}</span>
							<div class="evidence-name">
								<Icon class="size-4" />
								<div><strong>{standard.name}</strong><span>{standard.description}</span></div>
							</div>
							<span class:featured-state={index === 0} class="evidence-state">
								<i></i>{standard.status}
							</span>
						</div>
					{/each}
					<footer class="index-footer">
						<span>Owner: Security &amp; Operations</span>
						<span>Next review: October 2026</span>
					</footer>
				</div>

				<aside class="control-pledge">
					<div class="pledge-number">03</div>
					<p class="eyebrow">Operating commitments</p>
					<h3>Controls are only useful when the operating behavior is explicit.</h3>
					<ol>
						{#each commitments as commitment, index (commitment.title)}
							<li>
								<span>{String(index + 1).padStart(2, '0')}</span>
								<div>
									<strong>{commitment.title}</strong>
									<p>{commitment.description}</p>
								</div>
							</li>
						{/each}
					</ol>
				</aside>
			</div>

			<footer class="manifest-footer">
				<p>
					<LockIcon class="size-4" />No vague badges. Link every claim to a real owner and artifact.
				</p>
				<span>TRUST / 2026-07</span>
			</footer>
		</article>
	</div>
</section>

<style>
	.trust-heading {
		display: grid;
		gap: 2rem;
		align-items: end;
	}
	.trust-heading h2 {
		max-width: 48rem;
		margin-top: 1.25rem;
		font-size: clamp(2.25rem, 5vw, 4rem);
		font-weight: 650;
		line-height: 0.98;
		letter-spacing: -0.05em;
		text-wrap: balance;
	}
	.trust-heading > div:last-child > p {
		max-width: 35rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}
	.trust-manifest {
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
	}
	.manifest-header,
	.manifest-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
	}
	.manifest-header {
		border-bottom: 1px solid var(--border);
	}
	.manifest-header > div:first-child,
	.manifest-header > div:first-child > div,
	.review-stamp span,
	.manifest-footer p {
		display: flex;
		align-items: center;
		gap: 0.65rem;
	}
	.manifest-icon {
		display: grid;
		size: 2.35rem;
		place-items: center;
		border-radius: 0.65rem;
		background: var(--foreground);
		color: var(--background);
	}
	.manifest-header strong,
	.manifest-header span {
		display: block;
	}
	.manifest-header strong {
		font-size: 0.82rem;
	}
	.manifest-header > div:first-child > div > span,
	.review-stamp small {
		margin-top: 0.12rem;
		font-size: 0.68rem;
		color: var(--muted-foreground);
	}
	.review-stamp {
		border-left: 2px solid var(--primary);
		padding-left: 0.85rem;
	}
	.review-stamp span {
		color: var(--primary);
		font-size: 0.72rem;
		font-weight: 700;
	}
	.manifest-body {
		display: grid;
	}
	.evidence-index {
		padding: clamp(1.25rem, 3vw, 2rem);
	}
	.index-heading,
	.evidence-row {
		display: grid;
		grid-template-columns: 3.5rem minmax(0, 1fr) auto;
		align-items: center;
		gap: 1rem;
	}
	.index-heading {
		border-bottom: 1px solid var(--border);
		padding: 0 0 0.8rem;
		font-size: 0.65rem;
		font-weight: 700;
		color: var(--muted-foreground);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.evidence-row {
		min-height: 5rem;
		border-bottom: 1px solid var(--border);
	}
	.ref-number {
		font-size: 0.68rem;
		font-weight: 700;
		color: var(--primary);
	}
	.evidence-name {
		display: flex;
		align-items: center;
		gap: 0.8rem;
	}
	:global(.evidence-name > svg) {
		flex: none;
		color: var(--muted-foreground);
	}
	.evidence-name strong,
	.evidence-name span {
		display: block;
	}
	.evidence-name strong {
		font-size: 0.84rem;
	}
	.evidence-name span {
		margin-top: 0.2rem;
		font-size: 0.7rem;
		color: var(--muted-foreground);
	}
	.evidence-state {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.68rem;
		font-weight: 650;
		color: var(--muted-foreground);
	}
	.evidence-state i {
		display: block;
		size: 0.38rem;
		border-radius: 999px;
		background: currentColor;
	}
	.evidence-state.featured-state {
		color: var(--primary);
	}
	.index-footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.5rem 1rem;
		padding-top: 1rem;
		font-size: 0.65rem;
		color: var(--muted-foreground);
	}
	.control-pledge {
		position: relative;
		overflow: hidden;
		padding: clamp(1.75rem, 4vw, 3rem);
		background: var(--foreground);
		color: var(--background);
	}
	.pledge-number {
		position: absolute;
		top: -1rem;
		right: 1rem;
		font-size: clamp(6rem, 14vw, 10rem);
		font-weight: 700;
		line-height: 1;
		opacity: 0.05;
	}
	.eyebrow {
		position: relative;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		opacity: 0.55;
		text-transform: uppercase;
	}
	.control-pledge h3 {
		position: relative;
		max-width: 28rem;
		margin-top: 1rem;
		font-size: clamp(1.5rem, 3vw, 2.35rem);
		font-weight: 600;
		line-height: 1.08;
		letter-spacing: -0.035em;
		text-wrap: balance;
	}
	.control-pledge ol {
		display: grid;
		gap: 0;
		margin-top: 2.5rem;
	}
	.control-pledge li {
		display: grid;
		grid-template-columns: 2rem minmax(0, 1fr);
		gap: 0.8rem;
		border-top: 1px solid color-mix(in oklch, var(--background) 16%, transparent);
		padding: 1.15rem 0;
	}
	.control-pledge li > span {
		font-size: 0.65rem;
		color: var(--primary);
	}
	.control-pledge li strong {
		font-size: 0.8rem;
	}
	.control-pledge li p {
		margin-top: 0.3rem;
		font-size: 0.72rem;
		line-height: 1.55;
		opacity: 0.58;
	}
	.manifest-footer {
		border-top: 1px solid var(--border);
		font-size: 0.68rem;
		color: var(--muted-foreground);
	}
	.manifest-footer > span {
		font-family: var(--font-mono);
	}
	@media (min-width: 768px) {
		.trust-heading {
			grid-template-columns: 1.2fr 0.8fr;
		}
		.manifest-body {
			grid-template-columns: minmax(0, 1.25fr) minmax(22rem, 0.75fr);
		}
	}
	@media (max-width: 639px) {
		.review-stamp small,
		.manifest-header > div:first-child > div > span,
		.index-heading {
			display: none;
		}
		.evidence-row {
			grid-template-columns: 2.75rem minmax(0, 1fr);
			padding: 0.9rem 0;
		}
		.evidence-state {
			grid-column: 2;
		}
		.manifest-footer {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
