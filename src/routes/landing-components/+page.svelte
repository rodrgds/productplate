<script lang="ts">
	import {
		LandingBentoFeatures,
		LandingComparisonTable,
		LandingFaqSection,
		LandingFeatureTabs,
		LandingFinalCta,
		LandingFooter,
		LandingHero,
		LandingIntegrationCloud,
		LandingLogoMarquee,
		LandingNav,
		LandingPricingCards,
		LandingProcessTimeline,
		LandingStatsStrip,
		LandingTestimonialWall
	} from '$lib/components/landing';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { APP_NAME } from '$lib/constants';

	const componentGroups = [
		{
			title: 'Hero patterns',
			description: 'Navigation, product hero, logo marquee, and stats proof.',
			items: ['LandingNav', 'LandingHero', 'LandingLogoMarquee', 'LandingStatsStrip']
		},
		{
			title: 'Feature systems',
			description: 'Bento cells, tabs, comparison rows, integration clouds, and setup timelines.',
			items: [
				'LandingBentoFeatures',
				'LandingFeatureTabs',
				'LandingComparisonTable',
				'LandingIntegrationCloud',
				'LandingOrbitingCircles',
				'LandingProcessTimeline'
			]
		},
		{
			title: 'Conversion sections',
			description: 'Proof wall, pricing cards, FAQ accordion, final CTA, and footer.',
			items: [
				'LandingTestimonialWall',
				'LandingPricingCards',
				'LandingFaqSection',
				'LandingFinalCta',
				'LandingFooter'
			]
		}
	] as const;
</script>

<svelte:head>
	<title>Landing Components | {APP_NAME}</title>
	<meta
		name="description"
		content="A Product Plate gallery of reusable Svelte landing page components with dummy data, shadcn-svelte primitives, and source-owned reference patterns."
	/>
</svelte:head>

<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg"
>
	Skip to content
</a>

<div class="min-h-screen bg-background text-foreground">
	<LandingNav />

	<main id="main-content">
		<LandingHero />
		<LandingLogoMarquee />

		<section id="patterns" class="py-20 sm:py-24">
			<div class="mx-auto max-w-7xl px-6">
				<div class="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
					<div>
						<Badge variant="outline">Component map</Badge>
						<h2
							class="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
						>
							Hero patterns
						</h2>
					</div>
					<p class="max-w-2xl text-lg leading-8 text-muted-foreground lg:justify-self-end">
						Each section below is a source component in
						<code class="rounded-md bg-muted px-1.5 py-0.5 text-sm">src/lib/components/landing</code
						>
						with local dummy data and typed props.
					</p>
				</div>

				<div class="mt-12 grid gap-4 lg:grid-cols-3">
					{#each componentGroups as group (group.title)}
						<Card.Root>
							<Card.Header>
								<Card.Title>{group.title}</Card.Title>
								<Card.Description>{group.description}</Card.Description>
							</Card.Header>
							<Card.Content>
								<ul class="grid gap-2">
									{#each group.items as item (item)}
										<li class="rounded-lg border bg-muted/35 px-3 py-2 font-mono text-xs">
											{item}
										</li>
									{/each}
								</ul>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			</div>
		</section>

		<LandingStatsStrip />
		<LandingBentoFeatures />
		<LandingFeatureTabs />
		<LandingComparisonTable />
		<LandingProcessTimeline />
		<LandingIntegrationCloud />
		<LandingTestimonialWall />

		<section class="py-16 sm:py-20">
			<div class="mx-auto max-w-7xl px-6">
				<div class="rounded-2xl border bg-card p-8 shadow-sm sm:p-10">
					<Badge variant="outline">Conversion close</Badge>
					<h2 class="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
						Pricing and FAQ
					</h2>
					<p class="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
						The last scroll stretch gives users pricing, objections, and a final decision point
						without changing visual systems.
					</p>
				</div>
			</div>
		</section>

		<LandingPricingCards />
		<LandingFaqSection />
		<LandingFinalCta />
	</main>

	<LandingFooter />
</div>
