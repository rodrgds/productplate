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
		kicker = 'An inspectable workflow',
		title = 'Let buyers watch the handoff happen.',
		description = 'A compact run log makes the sequence concrete without turning the section into three more feature cards.',
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
		if (!steps.some((step) => step.value === activeStep)) activeStep = steps[0]?.value ?? '';
	});
</script>

<section id="workflow" class="border-b bg-muted/25 py-20 sm:py-24" data-testid="workflow-steps">
	<div class="mx-auto max-w-7xl px-6">
		<header class="workflow-header">
			<div>
				<Badge variant="outline">{kicker}</Badge>
				<h2>{title}</h2>
			</div>
			<p>{description}</p>
		</header>

		<Tabs.Root bind:value={activeStep} class="workflow-machine">
			<Tabs.List class="workflow-tabs">
				{#each steps as item (item.value)}
					<Tabs.Trigger value={item.value} class="workflow-trigger">
						<span>{item.step}</span><strong>{item.title}</strong>
					</Tabs.Trigger>
				{/each}
			</Tabs.List>

			{#each steps as item (item.value)}
				<Tabs.Content value={item.value} class="mt-0">
					<div class="workflow-stage">
						<div class="workflow-copy">
							<span>Step {item.step}</span>
							<h3>{item.title}</h3>
							<p>{item.description}</p>
							<Button href="#" variant="outline">
								Explore this step<ArrowUpRightIcon data-icon="inline-end" />
							</Button>
						</div>

						<div class="run-log">
							<div class="log-heading">
								<div><span class="live-dot"></span><strong>Run 0284</strong></div>
								<span>Completed in 1.8s</span>
							</div>
							<div class="log-row">
								<small>09:41:02</small><span><PlayIcon class="size-3.5" /></span>
								<div>
									<p>Trigger received</p>
									<strong>{item.event}</strong>
								</div>
							</div>
							<div class="log-row">
								<small>09:41:03</small><span><ClockIcon class="size-3.5" /></span>
								<div>
									<p>Ownership resolved</p>
									<strong>{item.owner}</strong>
								</div>
							</div>
							<div class="log-row complete">
								<small>09:41:04</small><span><CheckIcon class="size-3.5" /></span>
								<div>
									<p>Run completed</p>
									<strong>{item.result}</strong>
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
	.workflow-header {
		display: grid;
		gap: 2rem;
		align-items: end;
	}
	.workflow-header h2 {
		max-width: 42rem;
		margin-top: 1.25rem;
		font-size: clamp(2.25rem, 5vw, 3.75rem);
		font-weight: 650;
		line-height: 0.98;
		letter-spacing: -0.05em;
		text-wrap: balance;
	}
	.workflow-header > p {
		max-width: 34rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}
	:global(.workflow-machine) {
		overflow: hidden;
		margin-top: 3rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--background);
	}
	:global(.workflow-tabs) {
		display: grid;
		width: 100%;
		height: auto;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0;
		border-radius: 0;
		border-bottom: 1px solid var(--border);
		background: var(--muted);
		padding: 0;
	}
	:global(.workflow-trigger) {
		display: flex;
		height: auto;
		min-height: 4.75rem;
		align-items: center;
		justify-content: flex-start;
		gap: 0.75rem;
		border-radius: 0;
		padding: 1rem 1.25rem;
		white-space: normal;
	}
	:global(.workflow-trigger:not(:last-child)) {
		border-right: 1px solid var(--border);
	}
	:global(.workflow-trigger[data-state='active']) {
		background: var(--foreground);
		color: var(--background);
		box-shadow: none;
	}
	:global(.workflow-trigger span) {
		font-size: 0.68rem;
		color: var(--primary);
	}
	:global(.workflow-trigger strong) {
		font-size: 0.82rem;
		font-weight: 650;
		text-align: left;
	}
	.workflow-stage {
		display: grid;
		min-height: 30rem;
	}
	.workflow-copy {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: clamp(1.5rem, 5vw, 3.5rem);
	}
	.workflow-copy > span {
		font-size: 0.7rem;
		font-weight: 650;
		color: var(--primary);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.workflow-copy h3 {
		margin-top: 1rem;
		font-size: clamp(2rem, 4vw, 3.25rem);
		font-weight: 650;
		line-height: 0.98;
		letter-spacing: -0.05em;
	}
	.workflow-copy p {
		max-width: 32rem;
		margin-top: 1rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}
	.workflow-copy :global(a) {
		width: fit-content;
		margin-top: 2rem;
	}
	.run-log {
		align-self: center;
		margin: 1rem;
		border: 1px solid var(--border);
		border-radius: 0.85rem;
		background: var(--card);
	}
	.log-heading {
		display: flex;
		min-height: 3.5rem;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid var(--border);
		padding: 0 1rem;
	}
	.log-heading > div {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.log-heading strong,
	.log-heading > span {
		font-size: 0.7rem;
	}
	.log-heading > span {
		color: var(--muted-foreground);
	}
	.live-dot {
		display: block;
		size: 0.45rem;
		border-radius: 999px;
		background: var(--primary);
	}
	.log-row {
		display: grid;
		min-height: 5.25rem;
		grid-template-columns: 4.5rem 2rem minmax(0, 1fr);
		align-items: center;
		gap: 0.75rem;
		border-bottom: 1px solid var(--border);
		padding: 0.8rem 1rem;
	}
	.log-row:last-child {
		border-bottom: 0;
	}
	.log-row small {
		font-size: 0.65rem;
		color: var(--muted-foreground);
		font-variant-numeric: tabular-nums;
	}
	.log-row > span {
		display: grid;
		size: 2rem;
		place-items: center;
		border-radius: 999px;
		background: var(--muted);
		color: var(--muted-foreground);
	}
	.log-row.complete > span {
		background: var(--primary);
		color: var(--primary-foreground);
	}
	.log-row p {
		font-size: 0.68rem;
		color: var(--muted-foreground);
	}
	.log-row strong {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.82rem;
		font-weight: 650;
	}
	@media (min-width: 800px) {
		.workflow-header {
			grid-template-columns: 1fr 0.72fr;
		}
		.workflow-stage {
			grid-template-columns: 0.78fr 1.22fr;
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
		.log-row {
			grid-template-columns: 2rem minmax(0, 1fr);
		}
		.log-row small {
			display: none;
		}
	}
</style>
