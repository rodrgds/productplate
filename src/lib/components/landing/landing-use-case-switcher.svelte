<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckCircleIcon from '@lucide/svelte/icons/circle-check';
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import UsersIcon from '@lucide/svelte/icons/users';
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
		kicker = 'Built around your team',
		title = 'One product, tuned to the job in front of you.',
		description = 'Let each buyer see their own workflow without forcing them through separate pages or a generic list of features.',
		useCases = [
			{
				value: 'product',
				label: 'Product teams',
				title: 'Turn customer signal into a roadmap the team can trust.',
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
		if (!useCases.some((useCase) => useCase.value === selected)) {
			selected = useCases[0]?.value ?? '';
		}
	});
</script>

<section class="border-b py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="max-w-3xl">
			<Badge variant="outline">{kicker}</Badge>
			<h2 class="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
			<p class="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
		</div>

		<Tabs.Root bind:value={selected} class="mt-12">
			<div class="use-case-layout">
				<Tabs.List class="use-case-list">
					{#each useCases as item, index (item.value)}
						<Tabs.Trigger value={item.value} class="use-case-trigger">
							<span>{String(index + 1).padStart(2, '0')}</span>
							{item.label}
							<ArrowRightIcon class="size-4" />
						</Tabs.Trigger>
					{/each}
				</Tabs.List>

				<div class="min-w-0">
					{#each useCases as item (item.value)}
						<Tabs.Content value={item.value} class="mt-0">
							<div class="use-case-panel">
								<div class="use-case-copy">
									<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
										{item.label}
									</p>
									<h3>{item.title}</h3>
									<p>{item.description}</p>
									<ul>
										{#each item.outcomes as outcome (outcome)}
											<li>
												<CheckCircleIcon class="size-4 text-primary" />
												{outcome}
											</li>
										{/each}
									</ul>
									<Button href="#" variant="outline" class="mt-7">
										Explore {item.label.toLowerCase()}
										<ArrowRightIcon data-icon="inline-end" />
									</Button>
								</div>

								<div class="queue-window">
									<div class="queue-topbar">
										<div class="flex items-center gap-2">
											<UsersIcon class="size-4 text-muted-foreground" />
											<span>{item.queueLabel}</span>
										</div>
										<Badge variant="secondary">Today</Badge>
									</div>
									<div class="queue-body">
										{#each item.queueItems as queueItem, index (queueItem)}
											<div class="queue-row">
												<span class="queue-avatar">{index + 1}</span>
												<div class="min-w-0 flex-1">
													<p>{queueItem}</p>
													<span
														>{index === 0
															? 'Needs review'
															: index === 1
																? 'In progress'
																: 'Ready'}</span
													>
												</div>
												<MessageSquareIcon class="size-4 text-muted-foreground" />
											</div>
										{/each}
										<div class="queue-summary">
											<div>
												<span>Next summary</span>
												<strong>Prepared at 4:00 PM</strong>
											</div>
											<span class="size-8 rounded-full bg-primary"></span>
										</div>
									</div>
								</div>
							</div>
						</Tabs.Content>
					{/each}
				</div>
			</div>
		</Tabs.Root>
	</div>
</section>

<style>
	.use-case-layout {
		display: grid;
		gap: 1rem;
	}

	:global(.use-case-list) {
		display: grid;
		height: fit-content;
		gap: 0.5rem;
		background: transparent;
		padding: 0;
	}

	:global(.use-case-trigger) {
		display: grid;
		height: auto;
		min-height: 3.75rem;
		grid-template-columns: 2rem minmax(0, 1fr) auto;
		align-items: center;
		justify-content: stretch;
		gap: 0.6rem;
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		background: var(--card);
		padding: 0.8rem 1rem;
		text-align: left;
	}

	:global(.use-case-trigger span) {
		font-size: 0.72rem;
		color: var(--muted-foreground);
	}

	.use-case-panel {
		display: grid;
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: color-mix(in oklch, var(--muted) 25%, var(--background));
	}

	.use-case-copy {
		padding: clamp(1.5rem, 4vw, 2.5rem);
	}

	.use-case-copy h3 {
		max-width: 30rem;
		margin-top: 0.75rem;
		font-size: clamp(1.6rem, 3vw, 2.25rem);
		font-weight: 650;
		line-height: 1.1;
		letter-spacing: -0.03em;
	}

	.use-case-copy > p:last-of-type {
		max-width: 32rem;
		margin-top: 1rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}

	.use-case-copy ul {
		display: grid;
		gap: 0.7rem;
		margin-top: 1.5rem;
	}

	.use-case-copy li {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		font-size: 0.875rem;
		font-weight: 550;
	}

	.queue-window {
		margin: 0 1rem 1rem;
		border: 1px solid var(--border);
		border-radius: 0.85rem;
		background: var(--background);
		box-shadow: 0 18px 40px color-mix(in oklch, var(--foreground) 8%, transparent);
	}

	.queue-topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid var(--border);
		padding: 1rem;
		font-size: 0.82rem;
		font-weight: 650;
	}

	.queue-body {
		padding: 0.75rem;
	}

	.queue-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		border-bottom: 1px solid var(--border);
		padding: 0.85rem 0.35rem;
	}

	.queue-avatar {
		display: grid;
		size: 2rem;
		place-items: center;
		border-radius: 999px;
		background: var(--muted);
		font-size: 0.7rem;
		font-weight: 700;
	}

	.queue-row p,
	.queue-summary strong {
		font-size: 0.8rem;
		font-weight: 650;
	}

	.queue-row span:not(.queue-avatar),
	.queue-summary span {
		display: block;
		margin-top: 0.2rem;
		font-size: 0.7rem;
		color: var(--muted-foreground);
	}

	.queue-summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 0.75rem;
		border-radius: 0.65rem;
		background: var(--muted);
		padding: 0.85rem;
	}

	@media (min-width: 768px) {
		.use-case-layout {
			grid-template-columns: 14rem minmax(0, 1fr);
		}

		.use-case-panel {
			grid-template-columns: 0.86fr 1.14fr;
			align-items: center;
		}

		.queue-window {
			margin: 1rem 1rem 1rem 0;
		}
	}
</style>
