<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	interface Step {
		title: string;
		description: string;
		meta: string;
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
		description = 'Borrowed from proven long-form SaaS pages: fewer promises, clearer sequence, and scannable steps that can survive real launch copy.',
		steps = [
			{
				title: 'Pick the product story',
				description:
					'Choose the landing sections that match the offer, delete the rest, and keep the route readable.',
				meta: '15 minutes'
			},
			{
				title: 'Connect real surfaces',
				description:
					'Replace dummy proof with your routes, screenshots, billing model, and customer language.',
				meta: 'First build'
			},
			{
				title: 'Tune motion and density',
				description:
					'Keep only useful interactions, use semantic tokens, and preserve reduced-motion behavior.',
				meta: 'Polish pass'
			},
			{
				title: 'Ship and measure',
				description:
					'Point CTA actions at sign-up, trial, checkout, or a waitlist, then instrument the funnel.',
				meta: 'Launch day'
			}
		]
	}: Props = $props();
</script>

<section class="border-y bg-muted/30 py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="grid gap-10 lg:grid-cols-[0.74fr_1.26fr]">
			<div>
				<Badge variant="outline">{kicker}</Badge>
				<h2 class="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
					{title}
				</h2>
				<p class="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{description}</p>
				<Button href="#pricing" variant="outline" class="mt-8">
					Plan the page
					<ArrowRightIcon data-icon="inline-end" />
				</Button>
			</div>

			<div class="grid gap-4">
				{#each steps as step, index (step.title)}
					<article class="timeline-step">
						<div
							class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
						>
							{index + 1}
						</div>
						<div class="min-w-0">
							<div class="flex flex-wrap items-center gap-3">
								<h3 class="text-xl font-semibold tracking-tight">{step.title}</h3>
								<Badge variant="secondary">{step.meta}</Badge>
							</div>
							<p class="mt-2 leading-7 text-muted-foreground">{step.description}</p>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	:global(.timeline-step) {
		display: flex;
		gap: 1rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
		padding: 1rem;
		box-shadow: 0 1px 2px color-mix(in oklch, var(--foreground) 5%, transparent);
	}
</style>
