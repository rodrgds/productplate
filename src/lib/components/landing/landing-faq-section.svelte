<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion';
	import { Badge } from '$lib/components/ui/badge';

	interface FaqItem {
		question: string;
		answer: string;
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		items?: readonly FaqItem[];
	}

	let {
		kicker = 'FAQ',
		title = 'Questions that close the loop.',
		description = 'A simple accordion pattern for objections, setup details, migration notes, and product constraints.',
		items = [
			{
				question: 'Can these components be copied into another SvelteKit app?',
				answer:
					'Yes. They use ordinary Svelte components, Tailwind CSS v4 utilities, shadcn-svelte primitives, and local props.'
			},
			{
				question: 'Where should motion stay?',
				answer:
					'Use it for state changes that need orientation, like the shared tab indicator. Avoid blanket scroll reveals on proof, pricing, and comparison sections.'
			},
			{
				question: 'Can I replace the dummy data?',
				answer:
					'Yes. Each section ships with default dummy data and typed props so downstream projects can replace content from the route or a CMS.'
			},
			{
				question: 'Are these only for SaaS landing pages?',
				answer:
					'No. The sections are landing-page focused, but comparison, pricing, proof, timeline, and integration blocks also work on docs, onboarding, and product pages.'
			}
		]
	}: Props = $props();
</script>

<section id="faq" class="border-y bg-muted/30 py-20 sm:py-24">
	<div class="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.75fr_1.25fr]">
		<div>
			<Badge variant="outline">{kicker}</Badge>
			<h2 class="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
				{title}
			</h2>
			<p class="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{description}</p>
		</div>

		<Accordion.Root type="single" value="item-0" class="w-full">
			{#each items as item, index (item.question)}
				<Accordion.Item value={`item-${index}`}>
					<Accordion.Trigger class="text-left">{item.question}</Accordion.Trigger>
					<Accordion.Content class="max-w-3xl leading-7 text-muted-foreground">
						{item.answer}
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
	</div>
</section>
