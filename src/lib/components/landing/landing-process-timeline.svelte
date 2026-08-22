<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	interface Step {
		title: string;
		description: string;
		meta: string;
		deliverables: readonly string[];
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		steps?: readonly Step[];
	}

	let {
		kicker = 'Process',
		title = 'A timeline section for onboarding, setup, or delivery.',
		description = 'Borrowed from the Aceternity long-form timeline shape: sticky labels, a real rail, screenshots or deliverables beside each moment, and no generic scroll-in choreography.',
		steps = [
			{
				title: 'Pick the product story',
				description:
					'Choose the landing sections that match the offer, delete the rest, and keep the route readable.',
				meta: '15 minutes',
				deliverables: ['Hero angle', 'Proof type', 'Primary CTA']
			},
			{
				title: 'Connect real surfaces',
				description:
					'Replace dummy proof with your routes, screenshots, billing model, and customer language.',
				meta: 'First build',
				deliverables: ['App screenshot', 'Auth route', 'Pricing path']
			},
			{
				title: 'Tune motion and density',
				description:
					'Keep only useful interactions, use semantic tokens, and preserve reduced-motion behavior.',
				meta: 'Polish pass',
				deliverables: ['Hover states', 'Mobile spacing', 'A11y pass']
			},
			{
				title: 'Ship and measure',
				description:
					'Point CTA actions at sign-up, trial, checkout, or a waitlist, then instrument the funnel.',
				meta: 'Launch day',
				deliverables: ['Analytics event', 'Conversion goal', 'Support link']
			}
		]
	}: Props = $props();
</script>

<section class="py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="timeline-layout">
			<div class="timeline-intro">
				<Badge variant="outline">{kicker}</Badge>
				<h2>{title}</h2>
				<p>{description}</p>
				<Button href="#pricing" variant="outline">
					Plan the page
					<ArrowRightIcon data-icon="inline-end" />
				</Button>
			</div>

			<div class="timeline-list">
				{#each steps as step, index (step.title)}
					<article class="timeline-item">
						<div class="timeline-index">0{index + 1}</div>
						<div class="timeline-node">
							<span></span>
						</div>
						<div class="timeline-card">
							<div class="timeline-card-head">
								<Badge variant="secondary">{step.meta}</Badge>
								<h3>{step.title}</h3>
							</div>
							<p>{step.description}</p>
							<div class="deliverables">
								{#each step.deliverables as deliverable (deliverable)}
									<div>
										<CheckIcon class="size-4" />
										<span>{deliverable}</span>
									</div>
								{/each}
							</div>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.timeline-layout {
		display: grid;
		gap: 3rem;
	}

	.timeline-intro h2 {
		margin-top: 1.25rem;
		max-width: 38rem;
		font-size: clamp(2.25rem, 5vw, 3.6rem);
		font-weight: 650;
		line-height: 1.03;
		letter-spacing: 0;
		text-wrap: balance;
	}

	.timeline-intro p {
		margin-top: 1.25rem;
		max-width: 34rem;
		color: var(--muted-foreground);
		font-size: 1.08rem;
		line-height: 1.8;
	}

	.timeline-intro :global(a) {
		margin-top: 2rem;
	}

	.timeline-list {
		position: relative;
		display: grid;
		gap: 2rem;
	}

	.timeline-list::before {
		content: '';
		position: absolute;
		top: 0.5rem;
		bottom: 0.5rem;
		left: 1.2rem;
		width: 1px;
		background: linear-gradient(
			to bottom,
			transparent,
			var(--border) 8%,
			var(--border) 92%,
			transparent
		);
	}

	.timeline-item {
		position: relative;
		display: grid;
		grid-template-columns: 2.4rem minmax(0, 1fr);
		gap: 1rem;
	}

	.timeline-index {
		display: none;
		color: color-mix(in oklch, var(--foreground) 28%, transparent);
		font-size: clamp(2rem, 5vw, 4rem);
		font-weight: 800;
		line-height: 0.9;
		letter-spacing: 0;
	}

	.timeline-node {
		position: relative;
		display: flex;
		width: 2.4rem;
		height: 2.4rem;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
		background: color-mix(in oklch, var(--background) 92%, transparent);
	}

	.timeline-node span {
		width: 0.9rem;
		height: 0.9rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--primary);
		box-shadow: 0 0 0 0.45rem color-mix(in oklch, var(--primary) 8%, transparent);
	}

	.timeline-card {
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
		box-shadow: 0 1px 2px color-mix(in oklch, var(--foreground) 5%, transparent);
	}

	.timeline-card-head {
		display: grid;
		gap: 0.9rem;
		border-bottom: 1px solid var(--border);
		background: color-mix(in oklch, var(--muted) 38%, transparent);
		padding: 1.1rem;
	}

	.timeline-card h3 {
		font-size: clamp(1.35rem, 2vw, 2rem);
		font-weight: 650;
		line-height: 1.1;
		letter-spacing: 0;
	}

	.timeline-card p {
		padding: 1.1rem 1.1rem 0;
		color: var(--muted-foreground);
		line-height: 1.75;
	}

	.deliverables {
		display: grid;
		gap: 0.7rem;
		padding: 1.1rem;
	}

	.deliverables div {
		display: grid;
		grid-template-columns: 1.75rem 1fr;
		align-items: center;
		gap: 0.7rem;
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		background: var(--background);
		padding: 0.65rem 0.75rem;
		font-size: 0.9rem;
	}

	.deliverables :global(svg) {
		color: var(--foreground);
	}

	@media (min-width: 920px) {
		.timeline-layout {
			grid-template-columns: 0.72fr 1.28fr;
			align-items: start;
		}

		.timeline-intro {
			position: sticky;
			top: 6rem;
		}

		.timeline-list::before {
			left: calc(8rem + 1.2rem);
		}

		.timeline-item {
			grid-template-columns: 8rem 2.4rem minmax(0, 1fr);
			gap: 1.25rem;
			padding-top: 1.25rem;
		}

		.timeline-index {
			position: sticky;
			top: 6.25rem;
			display: block;
			align-self: start;
		}

		.timeline-node {
			position: sticky;
			top: 6.25rem;
			align-self: start;
		}

		.timeline-card {
			margin-bottom: 1rem;
		}
	}
</style>
