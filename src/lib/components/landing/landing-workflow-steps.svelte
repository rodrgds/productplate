<script lang="ts">
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ClockIcon from '@lucide/svelte/icons/clock-3';
	import PlayIcon from '@lucide/svelte/icons/play';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';

	interface WorkflowStep {
		value: string;
		step: string;
		title: string;
		description: string;
		event: string;
		owner: string;
		result: string;
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		steps?: readonly WorkflowStep[];
	}

	let {
		kicker = 'How it works',
		title = 'From signal to shipped work in three visible steps.',
		description = 'Use a guided workflow section when the product has a sequence customers need to understand before they can value the outcome.',
		steps = [
			{
				value: 'capture',
				step: '01',
				title: 'Capture the signal',
				description:
					'Collect requests from forms, email, and your product without losing the original context.',
				event: 'Enterprise request received',
				owner: 'Customer success',
				result: 'Context enriched'
			},
			{
				value: 'route',
				step: '02',
				title: 'Route the next move',
				description:
					'Apply ownership, priority, and a due date using rules the whole team can inspect.',
				event: 'Matches renewal workflow',
				owner: 'Account team',
				result: 'Owner assigned'
			},
			{
				value: 'close',
				step: '03',
				title: 'Close the loop',
				description:
					'Keep the customer and internal stakeholders updated as the work moves to completion.',
				event: 'Resolution approved',
				owner: 'Product operations',
				result: 'Customer notified'
			}
		]
	}: Props = $props();

	let activeStep = $state('');

	$effect(() => {
		if (!steps.some((step) => step.value === activeStep)) {
			activeStep = steps[0]?.value ?? '';
		}
	});
</script>

<section id="workflow" class="border-b bg-muted/25 py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="mx-auto max-w-3xl text-center">
			<Badge variant="outline">{kicker}</Badge>
			<h2 class="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
			<p class="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
		</div>

		<Tabs.Root bind:value={activeStep} class="mt-12">
			<Tabs.List class="workflow-tabs">
				{#each steps as item (item.value)}
					<Tabs.Trigger value={item.value} class="workflow-trigger">
						<span>{item.step}</span>
						<strong>{item.title}</strong>
					</Tabs.Trigger>
				{/each}
			</Tabs.List>

			{#each steps as item (item.value)}
				<Tabs.Content value={item.value} class="mt-6">
					<div class="workflow-panel">
						<div class="workflow-copy">
							<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
								Step {item.step}
							</p>
							<h3>{item.title}</h3>
							<p>{item.description}</p>
							<Button href="#" variant="outline" class="mt-7">
								Explore this step
								<ArrowUpRightIcon data-icon="inline-end" />
							</Button>
						</div>

						<div class="workflow-preview">
							<div class="preview-toolbar">
								<div>
									<p>Automation run</p>
									<strong>{item.event}</strong>
								</div>
								<Badge variant="secondary">
									<PlayIcon />
									Live
								</Badge>
							</div>

							<div class="preview-flow">
								<div class="flow-node">
									<span class="flow-icon bg-primary text-primary-foreground">
										<PlayIcon class="size-3.5" />
									</span>
									<div>
										<small>Trigger</small>
										<strong>{item.event}</strong>
									</div>
								</div>
								<div class="flow-connector" aria-hidden="true"></div>
								<div class="flow-node">
									<span class="flow-icon bg-muted text-foreground">
										<ClockIcon class="size-3.5" />
									</span>
									<div>
										<small>Route to</small>
										<strong>{item.owner}</strong>
									</div>
								</div>
								<div class="flow-connector" aria-hidden="true"></div>
								<div class="flow-node">
									<span class="flow-icon bg-primary text-primary-foreground">
										<CheckIcon class="size-3.5" />
									</span>
									<div>
										<small>Outcome</small>
										<strong>{item.result}</strong>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Tabs.Content>
			{/each}
		</Tabs.Root>
	</div>
</section>

<style>
	:global(.workflow-tabs) {
		display: grid;
		height: auto;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0;
		border: 1px solid var(--border);
		border-radius: 0.85rem;
		background: var(--background);
		padding: 0;
	}

	:global(.workflow-trigger) {
		display: flex;
		height: auto;
		min-height: 4.5rem;
		align-items: center;
		justify-content: flex-start;
		gap: 0.85rem;
		border-radius: 0;
		padding: 0.9rem 1rem;
		white-space: normal;
	}

	:global(.workflow-trigger:not(:last-child)) {
		border-right: 1px solid var(--border);
	}

	:global(.workflow-trigger span) {
		font-size: 0.72rem;
		color: var(--muted-foreground);
	}

	:global(.workflow-trigger strong) {
		font-size: 0.85rem;
		font-weight: 600;
		text-align: left;
	}

	.workflow-panel {
		display: grid;
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
	}

	.workflow-copy {
		padding: clamp(1.5rem, 4vw, 3rem);
	}

	.workflow-copy h3 {
		margin-top: 0.75rem;
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 650;
		line-height: 1.08;
		letter-spacing: -0.03em;
	}

	.workflow-copy > p:last-of-type {
		max-width: 34rem;
		margin-top: 1rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}

	.workflow-preview {
		margin: 0 1rem 1rem;
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		background: var(--background);
		box-shadow: 0 14px 34px color-mix(in oklch, var(--foreground) 7%, transparent);
	}

	.preview-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid var(--border);
		padding: 1rem;
	}

	.preview-toolbar p,
	.flow-node small {
		color: var(--muted-foreground);
		font-size: 0.72rem;
	}

	.preview-toolbar strong,
	.flow-node strong {
		display: block;
		margin-top: 0.2rem;
		font-size: 0.85rem;
		font-weight: 650;
	}

	.preview-flow {
		padding: clamp(1rem, 4vw, 2rem);
	}

	.flow-node {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		background: var(--card);
		padding: 0.9rem;
	}

	.flow-icon {
		display: grid;
		size: 2.25rem;
		flex: none;
		place-items: center;
		border-radius: 0.6rem;
	}

	.flow-connector {
		width: 1px;
		height: 1.5rem;
		margin-left: 1.125rem;
		background: var(--border);
	}

	@media (min-width: 900px) {
		.workflow-panel {
			grid-template-columns: 0.72fr 1.28fr;
			align-items: stretch;
		}

		.workflow-preview {
			align-self: center;
			margin: 1rem 1rem 1rem 0;
		}
	}

	@media (max-width: 639px) {
		:global(.workflow-tabs) {
			grid-template-columns: 1fr;
		}

		:global(.workflow-trigger:not(:last-child)) {
			border-right: 0;
			border-bottom: 1px solid var(--border);
		}
	}
</style>
