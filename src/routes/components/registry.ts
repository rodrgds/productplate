import {
	LandingAppleCardsCarousel,
	LandingBentoFeatures,
	LandingCaseStudy,
	LandingComparisonTable,
	LandingCtaBand,
	LandingDashboardHero,
	LandingFaqSection,
	LandingFeatureComparison,
	LandingFeatureSpotlight,
	LandingFeatureTabs,
	LandingFinalCta,
	LandingHero,
	LandingHeroVideoDialog,
	LandingIntegrationCloud,
	LandingLensShowcase,
	LandingLogoMarquee,
	LandingMigrationPlan,
	LandingOrbitingCircles,
	LandingPricingCards,
	LandingPricingComparison,
	LandingPricingMatrix,
	LandingProcessTimeline,
	LandingProblemSolution,
	LandingReleaseTimeline,
	LandingRoiCalculator,
	LandingStatsGrid,
	LandingStatsStrip,
	LandingTestimonialMarquee,
	LandingTestimonialWall,
	LandingTrustCenter,
	LandingUseCaseSwitcher,
	LandingWorkflowSteps
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
			{ key: 'video-dialog', label: 'Hero video dialog', Component: LandingHeroVideoDialog },
			{ key: 'dashboard-hero', label: 'Dashboard hero', Component: LandingDashboardHero }
		]
	},
	{
		id: 'features',
		title: 'Features',
		blurb: 'Bento grids, tabbed explorers, comparison tables, and timelines.',
		components: [
			{ key: 'bento', label: 'Bento features', Component: LandingBentoFeatures },
			{ key: 'tabs', label: 'Feature tabs', Component: LandingFeatureTabs },
			{ key: 'feature-comparison', label: 'Comparison table', Component: LandingFeatureComparison },
			{ key: 'image-comparison', label: 'Image comparison', Component: LandingComparisonTable },
			{ key: 'timeline', label: 'Process timeline', Component: LandingProcessTimeline },
			{ key: 'orbiting', label: 'Orbiting circles', Component: LandingOrbitingCircles },
			{ key: 'problem-solution', label: 'Problem and outcome', Component: LandingProblemSolution },
			{ key: 'workflow-steps', label: 'Workflow steps', Component: LandingWorkflowSteps },
			{ key: 'use-case-switcher', label: 'Use-case switcher', Component: LandingUseCaseSwitcher },
			{ key: 'feature-spotlight', label: 'Feature spotlight', Component: LandingFeatureSpotlight }
		]
	},
	{
		id: 'proof',
		title: 'Proof',
		blurb: 'Customer evidence, trust programs, testimonials, and product momentum.',
		components: [
			{ key: 'wall', label: 'Testimonial mosaic', Component: LandingTestimonialWall },
			{ key: 'marquee', label: 'Testimonial marquee', Component: LandingTestimonialMarquee },
			{ key: 'case-study', label: 'Customer case study', Component: LandingCaseStudy },
			{ key: 'trust-center', label: 'Trust center', Component: LandingTrustCenter },
			{ key: 'release-timeline', label: 'Release momentum', Component: LandingReleaseTimeline }
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
		id: 'conversion',
		title: 'Conversion',
		blurb: 'Interactive business cases and low-risk migration closes.',
		components: [
			{ key: 'roi-calculator', label: 'ROI calculator', Component: LandingRoiCalculator },
			{ key: 'migration-plan', label: 'Migration plan', Component: LandingMigrationPlan }
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
