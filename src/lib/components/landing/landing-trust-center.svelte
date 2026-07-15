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
		title = 'The answers your buyer needs before security review.',
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

	const icons = [ShieldCheckIcon, FileCheckIcon, GlobeIcon, LockIcon] as const;
</script>

<section class="border-b bg-muted/25 py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="trust-header">
			<div>
				<Badge variant="outline">
					<ShieldCheckIcon />
					{kicker}
				</Badge>
				<h2>{title}</h2>
			</div>
			<div>
				<p>{description}</p>
				<Button href={ctaHref} variant="outline" class="mt-6">
					{ctaLabel}
					<ArrowUpRightIcon data-icon="inline-end" />
				</Button>
			</div>
		</div>

		<div class="trust-ledger mt-12">
			<div class="ledger-heading">
				<span>Program</span><span>Coverage</span><span>Status</span>
			</div>
			{#each standards as standard, index (standard.name)}
				{@const Icon = icons[index % icons.length]}
				<div class="ledger-row">
					<div class="ledger-name">
						<span class="ledger-icon">
							<Icon class="size-4" />
						</span>
						<strong>{standard.name}</strong>
					</div>
					<p>{standard.description}</p>
					<Badge variant={index === 0 ? 'secondary' : 'outline'}>{standard.status}</Badge>
				</div>
			{/each}
		</div>

		<div class="commitment-grid">
			{#each commitments as commitment, index (commitment.title)}
				<article>
					<div class="flex items-center justify-between gap-4">
						<span>{String(index + 1).padStart(2, '0')}</span>
						<CheckIcon class="size-4 text-primary" />
					</div>
					<h3>{commitment.title}</h3>
					<p>{commitment.description}</p>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.trust-header {
		display: grid;
		gap: 2rem;
		align-items: end;
	}

	.trust-header h2 {
		max-width: 42rem;
		margin-top: 1.25rem;
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 650;
		line-height: 1.02;
		letter-spacing: -0.045em;
		text-wrap: balance;
	}

	.trust-header > div:last-child > p {
		max-width: 38rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}

	.trust-ledger {
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
	}

	.ledger-heading,
	.ledger-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) 6rem;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.25rem;
	}

	.ledger-heading {
		background: var(--muted);
		font-size: 0.7rem;
		font-weight: 650;
		color: var(--muted-foreground);
	}

	.ledger-row {
		min-height: 4.75rem;
		border-top: 1px solid var(--border);
	}

	.ledger-name {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.ledger-name strong {
		font-size: 0.9rem;
		font-weight: 650;
	}

	.ledger-icon {
		display: grid;
		size: 2.25rem;
		flex: none;
		place-items: center;
		border-radius: 0.65rem;
		background: var(--muted);
		color: var(--primary);
	}

	.ledger-row > p {
		font-size: 0.82rem;
		color: var(--muted-foreground);
	}

	.commitment-grid {
		display: grid;
		margin-top: 1rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--background);
	}

	.commitment-grid article {
		padding: 1.5rem;
	}

	.commitment-grid article:not(:last-child) {
		border-bottom: 1px solid var(--border);
	}

	.commitment-grid article > div span {
		font-size: 0.7rem;
		font-weight: 650;
		color: var(--muted-foreground);
	}

	.commitment-grid h3 {
		margin-top: 2rem;
		font-size: 1rem;
		font-weight: 650;
	}

	.commitment-grid p {
		margin-top: 0.5rem;
		color: var(--muted-foreground);
		font-size: 0.85rem;
		line-height: 1.65;
	}

	@media (min-width: 768px) {
		.trust-header {
			grid-template-columns: 1fr 0.8fr;
		}

		.commitment-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.commitment-grid article:not(:last-child) {
			border-right: 1px solid var(--border);
			border-bottom: 0;
		}
	}

	@media (max-width: 639px) {
		.ledger-heading {
			display: none;
		}

		.ledger-row {
			grid-template-columns: minmax(0, 1fr) auto;
			gap: 0.75rem;
		}

		.ledger-row > p {
			grid-column: 1 / -1;
			padding-left: 3rem;
		}
	}
</style>
