import {
	LandingAppleCardsCarousel,
	LandingComparisonTable,
	LandingCtaBand,
	LandingFaqSection,
	LandingFeatureComparison,
	LandingFeatureTabs,
	LandingFinalCta,
	LandingHero,
	LandingHeroVideoDialog,
	LandingIntegrationCloud,
	LandingLensShowcase,
	LandingLogoMarquee,
	LandingOrbitingCircles,
	LandingPricingCards,
	LandingPricingComparison,
	LandingPricingMatrix,
	LandingProcessTimeline,
	LandingStatsGrid,
	LandingStatsStrip,
	LandingTestimonialMarquee,
	LandingTestimonialWall
} from '$lib/components/landing';
import type { Component } from 'svelte';

export interface ShowcaseEntry {
	key: string;
	label: string;
	Component: Component;
}

export interface Category {
	id: string;
	title: string;
	blurb: string;
	components: readonly ShowcaseEntry[];
}

export const categories: readonly Category[] = [
	{
		id: 'hero',
		title: 'Hero',
		blurb: 'Above-the-fold openers with product previews and video dialogs.',
		components: [
			{ key: 'hero', label: 'Product hero', Component: LandingHero },
			{ key: 'video-dialog', label: 'Hero video dialog', Component: LandingHeroVideoDialog }
		]
	},
	{
		id: 'features',
		title: 'Features',
		blurb: 'Tabbed explorers, comparison tables, timelines, and visual diagrams.',
		components: [
			{ key: 'tabs', label: 'Feature tabs', Component: LandingFeatureTabs },
			{ key: 'feature-comparison', label: 'Comparison table', Component: LandingFeatureComparison },
			{ key: 'image-comparison', label: 'Image comparison', Component: LandingComparisonTable },
			{ key: 'timeline', label: 'Process timeline', Component: LandingProcessTimeline },
			{ key: 'orbiting', label: 'Orbiting circles', Component: LandingOrbitingCircles }
		]
	},
	{
		id: 'proof',
		title: 'Proof',
		blurb: 'Customer quotes and testimonial collections.',
		components: [
			{ key: 'wall', label: 'Testimonial mosaic', Component: LandingTestimonialWall },
			{ key: 'marquee', label: 'Testimonial marquee', Component: LandingTestimonialMarquee }
		]
	},
	{
		id: 'pricing',
		title: 'Pricing',
		blurb: 'Plan cards, comparison tables, and a full feature matrix.',
		components: [
			{ key: 'cards', label: 'Pricing cards', Component: LandingPricingCards },
			{ key: 'comparison', label: 'Pricing comparison', Component: LandingPricingComparison },
			{ key: 'matrix', label: 'Pricing matrix', Component: LandingPricingMatrix }
		]
	},
	{
		id: 'faq',
		title: 'FAQ',
		blurb: 'Accordion-based question and answer sections.',
		components: [{ key: 'accordion', label: 'FAQ accordion', Component: LandingFaqSection }]
	},
	{
		id: 'cta',
		title: 'Call to action',
		blurb: 'Closing conversion bands and split CTA layouts.',
		components: [
			{ key: 'final', label: 'Final CTA', Component: LandingFinalCta },
			{ key: 'band', label: 'Split CTA band', Component: LandingCtaBand }
		]
	},
	{
		id: 'utility',
		title: 'Utility',
		blurb: 'Logo marquees, stat strips, and integration clouds.',
		components: [
			{ key: 'logo-marquee', label: 'Logo marquee', Component: LandingLogoMarquee },
			{ key: 'stats-strip', label: 'Stats strip', Component: LandingStatsStrip },
			{ key: 'stats-grid', label: 'Stats grid', Component: LandingStatsGrid },
			{ key: 'integration', label: 'Integration cloud', Component: LandingIntegrationCloud }
		]
	},
	{
		id: 'showcase',
		title: 'Showcase',
		blurb: 'Carousels and lens-style interactive previews.',
		components: [
			{ key: 'carousel', label: 'Apple cards carousel', Component: LandingAppleCardsCarousel },
			{ key: 'lens', label: 'Lens showcase', Component: LandingLensShowcase }
		]
	}
];

export const categoryMap: Record<string, Category> = Object.fromEntries(
	categories.map((category) => [category.id, category])
);

export function getCategory(id: string): Category | undefined {
	return categoryMap[id];
}
