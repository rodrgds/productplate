<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';

	interface UseCase {
		value: string;
		label: string;
		title: string;
		description: string;
		outcomes: readonly string[];
		queueLabel: string;
		queueItems: readonly string[];
	}
	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		useCases?: readonly UseCase[];
	}

	let {
		kicker = 'Built around the job',
		title = 'Change the point of view, not the whole page.',
		description = 'A single switchboard lets each buyer see their own operating language while the product model stays coherent.',
		useCases = [
			{
				value: 'product',
				label: 'Product teams',
				title: 'Turn customer signal into a roadmap the team can defend.',
				description:
					'Group related feedback, preserve the source, and keep decisions linked to delivery.',
				outcomes: [
					'Evidence-backed priorities',
					'Clear stakeholder updates',
					'Fewer duplicate requests'
				],
				queueLabel: 'Product signal',
				queueItems: ['Search export requested', 'Bulk editing friction', 'New billing role']
			},
			{
				value: 'success',
				label: 'Customer success',
				title: 'Give every account the follow-through it was promised.',
				description:
					'Route risks and commitments to the right owner before they disappear into meeting notes.',
				outcomes: ['Renewal risks surfaced', 'Commitments stay visible', 'Health reviews prepared'],
				queueLabel: 'Account follow-up',
				queueItems: ['Prepare renewal brief', 'Escalate adoption risk', 'Share resolved request']
			},
			{
				value: 'operations',
				label: 'Operations',
				title: 'Standardize recurring work without hiding how it runs.',
				description:
					'Create inspectable workflows that keep teams aligned while leaving room for judgment.',
				outcomes: ['Consistent handoffs', 'Auditable decisions', 'Less manual reporting'],
				queueLabel: 'Operations queue',
				queueItems: ['Approve vendor intake', 'Review access request', 'Publish weekly digest']
			}
		]
	}: Props = $props();

	let selected = $state('');
	$effect(() => {
		if (!useCases.some((useCase) => useCase.value === selected))
			selected = useCases[0]?.value ?? '';
	});
</script>

<section class="border-b py-20 sm:py-24" data-testid="use-case-switcher">
	<div class="mx-auto max-w-7xl px-6">
		<header class="use-case-header">
			<div>
				<Badge variant="outline">{kicker}</Badge>
				<h2>{title}</h2>
			</div>
			<p>{description}</p>
		</header>

		<Tabs.Root bind:value={selected} class="use-case-shell">
			<Tabs.List class="use-case-list" aria-label="Choose a team">
				{#each useCases as item, index (item.value)}
					<Tabs.Trigger value={item.value} class="use-case-trigger"
						><span>{String(index + 1).padStart(2, '0')}</span>{item.label}</Tabs.Trigger
					>
				{/each}
			</Tabs.List>

			{#each useCases as item (item.value)}
				<Tabs.Content value={item.value} class="mt-0">
					<div class="use-case-stage">
						<div class="use-case-copy">
							<p>{item.label}</p>
							<h3>{item.title}</h3>
							<span>{item.description}</span>
							<ul>
								{#each item.outcomes as outcome (outcome)}<li>
										<CheckIcon class="size-3.5" />{outcome}
									</li>{/each}
							</ul>
							<Button href="#" variant="secondary"
								>Explore {item.label.toLowerCase()}<ArrowRightIcon data-icon="inline-end" /></Button
							>
						</div>

						<div class="use-case-queue">
							<div class="queue-heading"><span>{item.queueLabel}</span><small>Today</small></div>
							<ol>
								{#each item.queueItems as queueItem, index (queueItem)}
									<li>
										<span>{String(index + 1).padStart(2, '0')}</span><strong>{queueItem}</strong
										><small
											>{index === 0 ? 'Needs review' : index === 1 ? 'In progress' : 'Ready'}</small
										>
									</li>
								{/each}
							</ol>
							<div class="queue-footer">
								<span>Next summary</span><strong>Prepared at 4:00 PM</strong>
							</div>
						</div>
					</div>
				</Tabs.Content>
			{/each}
		</Tabs.Root>
	</div>
</section>

<style>
	.use-case-header {
		display: grid;
		gap: 2rem;
		align-items: end;
	}
	.use-case-header h2 {
		max-width: 42rem;
		margin-top: 1.25rem;
		font-size: clamp(2.25rem, 5vw, 3.75rem);
		font-weight: 650;
		line-height: 0.98;
		letter-spacing: -0.05em;
		text-wrap: balance;
	}
	.use-case-header > p {
		max-width: 34rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}
	:global(.use-case-shell) {
		overflow: hidden;
		margin-top: 3rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
	}
	:global(.use-case-list) {
		display: grid;
		width: 100%;
		height: auto;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0;
		border-radius: 0;
		border-bottom: 1px solid var(--border);
		background: var(--background);
		padding: 0;
	}
	:global(.use-case-trigger) {
		display: flex;
		height: auto;
		min-height: 4rem;
		align-items: center;
		justify-content: flex-start;
		gap: 0.7rem;
		border-radius: 0;
		padding: 0.8rem 1rem;
	}
	:global(.use-case-trigger:not(:last-child)) {
		border-right: 1px solid var(--border);
	}
	:global(.use-case-trigger span) {
		font-size: 0.68rem;
		color: var(--primary);
	}
	:global(.use-case-trigger[data-state='active']) {
		background: var(--muted);
		box-shadow: inset 0 -3px var(--primary);
	}
	.use-case-stage {
		display: grid;
	}
	.use-case-copy {
		padding: clamp(1.5rem, 5vw, 3.5rem);
		background: var(--foreground);
		color: var(--background);
	}
	.use-case-copy > p {
		font-size: 0.7rem;
		font-weight: 650;
		color: var(--primary);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.use-case-copy h3 {
		max-width: 38rem;
		margin-top: 1.25rem;
		font-size: clamp(2rem, 4vw, 3.25rem);
		font-weight: 650;
		line-height: 0.98;
		letter-spacing: -0.05em;
	}
	.use-case-copy > span {
		display: block;
		max-width: 34rem;
		margin-top: 1rem;
		font-size: 0.9rem;
		line-height: 1.7;
		opacity: 0.62;
	}
	.use-case-copy ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem 1.1rem;
		margin-top: 2rem;
	}
	.use-case-copy li {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.72rem;
		font-weight: 600;
	}
	.use-case-copy li :global(svg) {
		color: var(--primary);
	}
	.use-case-copy :global(a) {
		margin-top: 2.5rem;
	}
	.use-case-queue {
		display: flex;
		flex-direction: column;
		padding: clamp(1.5rem, 4vw, 2.5rem);
		background: var(--background);
	}
	.queue-heading,
	.queue-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.queue-heading span,
	.queue-heading small {
		font-size: 0.7rem;
		font-weight: 650;
	}
	.queue-heading small {
		color: var(--muted-foreground);
	}
	.use-case-queue ol {
		margin-top: 1.5rem;
		border-top: 1px solid var(--border);
	}
	.use-case-queue li {
		display: grid;
		min-height: 4.75rem;
		grid-template-columns: 2rem minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.75rem;
		border-bottom: 1px solid var(--border);
	}
	.use-case-queue li > span {
		font-size: 0.68rem;
		color: var(--primary);
	}
	.use-case-queue li strong {
		font-size: 0.85rem;
		font-weight: 650;
	}
	.use-case-queue li small {
		font-size: 0.68rem;
		color: var(--muted-foreground);
	}
	.queue-footer {
		margin-top: auto;
		padding-top: 2rem;
	}
	.queue-footer span,
	.queue-footer strong {
		font-size: 0.72rem;
	}
	.queue-footer span {
		color: var(--muted-foreground);
	}
	@media (min-width: 800px) {
		.use-case-header {
			grid-template-columns: 1fr 0.72fr;
		}
		.use-case-stage {
			grid-template-columns: 1.08fr 0.92fr;
			min-height: 32rem;
		}
	}
	@media (max-width: 639px) {
		:global(.use-case-list) {
			grid-template-columns: 1fr;
		}
		:global(.use-case-trigger:not(:last-child)) {
			border-right: 0;
			border-bottom: 1px solid var(--border);
		}
	}
</style>
