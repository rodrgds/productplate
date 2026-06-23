<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	interface Plan {
		name: string;
		price: string;
		description: string;
		features: readonly string[];
		featured?: boolean;
		cta: string;
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		plans?: readonly Plan[];
	}

	let {
		kicker = 'Pricing',
		title = 'Pricing cards that map cleanly to billing state.',
		description = 'Use this for public pricing, checkout funnels, waitlists, or a productized service offer.',
		plans = [
			{
				name: 'Starter',
				price: '$19',
				description: 'For validating one launch with polished defaults.',
				features: ['Landing sections', 'Auth-ready routes', 'Basic proof blocks'],
				cta: 'Start lean'
			},
			{
				name: 'Launch',
				price: '$49',
				description: 'For founders preparing a real beta or paid plan.',
				features: [
					'Everything in Starter',
					'Billing copy patterns',
					'Feature and proof systems',
					'FAQ and comparison'
				],
				featured: true,
				cta: 'Launch faster'
			},
			{
				name: 'Scale',
				price: '$129',
				description: 'For teams that need a sharper marketing system.',
				features: [
					'Everything in Launch',
					'Custom stack cloud',
					'Deeper testimonial wall',
					'Team CTA patterns'
				],
				cta: 'Build the system'
			}
		]
	}: Props = $props();
</script>

<section id="pricing" class="py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="mx-auto max-w-3xl text-center">
			<Badge variant="outline">{kicker}</Badge>
			<h2 class="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h2>
			<p class="mt-5 text-lg leading-8 text-muted-foreground">{description}</p>
		</div>

		<div class="mt-12 grid gap-4 lg:grid-cols-3">
			{#each plans as plan (plan.name)}
				<Card.Root
					class={plan.featured
						? 'relative h-full bg-primary text-primary-foreground'
						: 'relative h-full'}
				>
					{#if plan.featured}
						<div class="absolute top-4 right-4">
							<Badge variant="secondary">
								<SparklesIcon />
								Popular
							</Badge>
						</div>
					{/if}
					<Card.Header>
						<Card.Title>{plan.name}</Card.Title>
						<Card.Description class={plan.featured ? 'text-primary-foreground/70' : ''}>
							{plan.description}
						</Card.Description>
					</Card.Header>
					<Card.Content class="flex flex-1 flex-col">
						<div>
							<span class="text-4xl font-semibold tracking-tight">{plan.price}</span>
							<span class={plan.featured ? 'text-primary-foreground/70' : 'text-muted-foreground'}
								>/mo</span
							>
						</div>
						<ul class="mt-6 grid gap-3">
							{#each plan.features as feature (feature)}
								<li class="flex items-start gap-2 text-sm">
									<CheckIcon class="mt-0.5 size-4 shrink-0" />
									<span>{feature}</span>
								</li>
							{/each}
						</ul>
					</Card.Content>
					<Card.Footer>
						<Button
							href={resolve('/auth/sign-up')}
							variant={plan.featured ? 'secondary' : 'default'}
							class="w-full"
						>
							{plan.cta}
						</Button>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	</div>
</section>
