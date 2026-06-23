<script lang="ts">
	import QuoteIcon from '@lucide/svelte/icons/quote';
	import { Badge } from '$lib/components/ui/badge';

	interface Testimonial {
		name: string;
		role: string;
		quote: string;
		image: string;
		imageAlt: string;
		size?: 'feature' | 'wide' | 'tall' | 'normal';
		tone?: 'featured' | 'default';
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		testimonials?: readonly Testimonial[];
	}

	let {
		kicker = 'Proof sections',
		title = 'A mosaic proof wall for testimonials, screenshots, and founder signals.',
		description = 'Inspired by Aceternity and Magic UI proof blocks: uneven cards, real image slots, and enough density to feel like social proof instead of decoration.',
		testimonials = [
			{
				name: 'Mina Kim',
				role: 'Founder, Northstar Notes',
				quote:
					'We replaced a generic hero, pricing table, and FAQ in one afternoon. The sections were already shaped around actual SaaS routes.',
				image:
					'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80',
				imageAlt: 'Portrait of a founder using the product',
				size: 'feature',
				tone: 'featured'
			},
			{
				name: 'Avery Reed',
				role: 'Indie maker',
				quote:
					'The best part is that the components are not hidden behind a package. I changed the markup, copy, and spacing directly.',
				image:
					'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
				imageAlt: 'Portrait of an indie maker',
				size: 'tall'
			},
			{
				name: 'Jon Lane',
				role: 'Product engineer',
				quote:
					'The tabs and bento sections feel much more like components I would actually copy into a starter.',
				image:
					'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
				imageAlt: 'Portrait of a product engineer'
			},
			{
				name: 'Iris Park',
				role: 'Design partner',
				quote:
					'It gives founders a real launch page vocabulary: proof, comparison, pricing, product shots, and a final CTA.',
				image:
					'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
				imageAlt: 'Portrait of a design partner',
				size: 'wide'
			},
			{
				name: 'Sam Kaur',
				role: 'Builder in residence',
				quote:
					'I used the comparison section to explain why our product was not another dashboard template.',
				image:
					'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=700&q=80',
				imageAlt: 'Portrait of a builder in residence'
			},
			{
				name: 'Chris Noel',
				role: 'Early customer',
				quote:
					'The default copy is dummy data, but the structure is right. That made it much easier to write our real story.',
				image:
					'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=700&q=80',
				imageAlt: 'Portrait of an early customer',
				size: 'tall'
			},
			{
				name: 'Launch room',
				role: 'Product screenshot slot',
				quote:
					'Swap this wide image with a founder video still, a customer Slack wall, or a real app screenshot.',
				image:
					'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
				imageAlt: 'Workspace with desks and product planning boards',
				size: 'wide'
			}
		]
	}: Props = $props();
</script>

<section id="proof" class="py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="mx-auto max-w-3xl text-center">
			<Badge variant="outline">{kicker}</Badge>
			<h2 class="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h2>
			<p class="mt-5 text-lg leading-8 text-muted-foreground">{description}</p>
		</div>

		<div class="proof-mosaic mt-12">
			{#each testimonials as testimonial (testimonial.name)}
				<figure
					class={[
						'proof-card',
						testimonial.size ? `proof-card-${testimonial.size}` : '',
						testimonial.tone === 'featured' ? 'proof-card-featured-tone' : ''
					]
						.filter(Boolean)
						.join(' ')}
				>
					<div class="proof-media">
						<img src={testimonial.image} alt={testimonial.imageAlt} loading="lazy" />
					</div>
					<div class="proof-body">
						<QuoteIcon class="size-5 opacity-70" />
						<blockquote>"{testimonial.quote}"</blockquote>
					</div>
					<figcaption class="proof-caption">
						<span>{testimonial.name}</span>
						<small>{testimonial.role}</small>
					</figcaption>
				</figure>
			{/each}
		</div>
	</div>
</section>

<style>
	.proof-mosaic {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.proof-card {
		display: grid;
		overflow: hidden;
		min-height: 18rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
		box-shadow: 0 1px 2px color-mix(in oklch, var(--foreground) 5%, transparent);
	}

	.proof-media {
		position: relative;
		min-height: 8rem;
		background: var(--muted);
	}

	.proof-media img {
		width: 100%;
		height: 100%;
		min-height: 8rem;
		object-fit: cover;
		display: block;
	}

	.proof-body {
		display: flex;
		min-height: 0;
		flex-direction: column;
		padding: 1.25rem 1.25rem 0;
	}

	.proof-body blockquote {
		margin-top: 0.9rem;
		color: var(--muted-foreground);
		font-size: 0.98rem;
		line-height: 1.75;
	}

	.proof-caption {
		display: grid;
		gap: 0.25rem;
		margin-top: auto;
		padding: 1.5rem 1.25rem 1.25rem;
	}

	.proof-caption span {
		font-weight: 650;
	}

	.proof-caption small {
		color: var(--muted-foreground);
		font-size: 0.8rem;
	}

	.proof-card-featured-tone {
		background: var(--primary);
		color: var(--primary-foreground);
	}

	.proof-card-featured-tone .proof-body blockquote,
	.proof-card-featured-tone .proof-caption small {
		color: color-mix(in oklch, var(--primary-foreground) 72%, transparent);
	}

	@media (min-width: 768px) {
		.proof-mosaic {
			grid-auto-rows: minmax(8rem, auto);
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}

		.proof-card {
			grid-column: span 3;
		}

		.proof-card-wide {
			grid-column: span 6;
			grid-template-columns: 0.95fr 1.05fr;
		}

		.proof-card-tall {
			grid-row: span 2;
		}

		.proof-card-feature {
			grid-column: span 6;
			grid-template-columns: 0.9fr 1.1fr;
		}

		.proof-card-wide .proof-media,
		.proof-card-feature .proof-media {
			grid-row: 1 / span 2;
			min-height: 100%;
		}

		.proof-card-wide .proof-body,
		.proof-card-feature .proof-body,
		.proof-card-wide .proof-caption,
		.proof-card-feature .proof-caption {
			grid-column: 2;
		}

		.proof-card-wide .proof-media img,
		.proof-card-feature .proof-media img {
			min-height: 100%;
		}
	}

	@media (min-width: 1120px) {
		.proof-mosaic {
			grid-template-columns: repeat(12, minmax(0, 1fr));
		}

		.proof-card {
			grid-column: span 3;
		}

		.proof-card-wide {
			grid-column: span 6;
		}

		.proof-card-feature {
			grid-column: span 6;
			grid-row: span 2;
		}

		.proof-card-tall {
			grid-column: span 3;
			grid-row: span 2;
		}
	}
</style>
