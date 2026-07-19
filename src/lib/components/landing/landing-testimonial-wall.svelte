<script lang="ts">
	import BrandLogo from './brand-logo.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';

	interface Testimonial {
		id?: string;
		name: string;
		role?: string;
		avatar: string;
		content: string;
		source?: string;
		link?: string;
	}

	interface Props {
		testimonials?: readonly Testimonial[];
		heading?: string;
		description?: string;
		visibleCount?: number;
		collapsedHeight?: string;
		showMoreLabel?: string;
	}

	let {
		heading = 'Testimonials',
		description = 'Sample layout. Replace every name, portrait, quote, role, and source before publishing.',
		testimonials = [
			{
				id: '1',
				name: 'Sarah Chen',
				role: 'CEO & Founder',
				avatar:
					'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&h=160&q=80',
				content:
					'This starter completely transformed how we build. We shipped our entire customer-facing dashboard in half the time, and design consistency across every page was noticeably better.',
				source: 'X',
				link: '#'
			},
			{
				id: '2',
				name: 'Marcus Rodriguez',
				role: 'CTO',
				avatar:
					'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80',
				content:
					'The attention to accessibility and performance is outstanding. Our Lighthouse scores improved by 15 points across the board, and we passed our first external accessibility audit with zero critical issues.',
				source: 'LinkedIn',
				link: '#'
			},
			{
				id: '3',
				name: 'Emily Watson',
				role: 'Head of Product',
				avatar:
					'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80',
				content:
					'Finally, a foundation that developers actually want to use. The defaults are sensible and the components are flexible.',
				source: 'X',
				link: '#'
			},
			{
				id: '4',
				name: 'David Kim',
				role: 'Tech Lead',
				avatar:
					'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&h=160&q=80',
				content:
					'We evaluated five starters over two quarters before settling on this one. Every piece felt production-ready out of the box.',
				source: 'Reddit',
				link: '#'
			},
			{
				id: '5',
				name: 'Rachel Foster',
				role: 'Senior Designer',
				avatar:
					'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=160&h=160&q=80',
				content:
					'As a designer, I appreciate how closely the components match our Figma designs. The design-to-dev handoff has never been smoother, and the spacing system makes it easy to maintain visual consistency across dozens of screens.',
				source: 'X',
				link: '#'
			},
			{
				id: '6',
				name: 'James Mitchell',
				role: 'Full Stack Developer',
				avatar:
					'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&h=160&q=80',
				content:
					'The TypeScript support is best-in-class. Autocomplete just works, prop types catch mistakes before they hit production, and the DX is genuinely enjoyable.',
				source: 'LinkedIn',
				link: '#'
			},
			{
				id: '7',
				name: 'Nina Patel',
				role: 'UX Engineer',
				avatar:
					'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=160&h=160&q=80',
				content:
					'These components handle edge cases I did not even think to test for. Dark mode, RTL support, keyboard navigation, and screen reader announcements are all built in from the start.',
				source: 'PH',
				link: '#'
			},
			{
				id: '8',
				name: 'Alex Thompson',
				role: 'Engineering Manager',
				avatar:
					'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&h=160&q=80',
				content:
					'Our team velocity increased measurably after adopting this. Less time on UI boilerplate means more time on the features our customers actually care about.',
				source: 'X',
				link: '#'
			},
			{
				id: '9',
				name: 'Henry Garcia',
				role: 'Product Lead',
				avatar:
					'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&h=160&q=80',
				content:
					'We rebuilt our entire onboarding flow using these blocks and launched it in under three weeks. Our activation rate is up 20% since the redesign.',
				source: 'Reddit',
				link: '#'
			}
		],
		visibleCount = 6,
		collapsedHeight = '42rem',
		showMoreLabel = 'Show more testimonials'
	}: Props = $props();

	let expanded = $state(false);
	const hasMore = $derived(testimonials.length > visibleCount);
	const clampClasses = [
		'line-clamp-3',
		'line-clamp-5',
		'line-clamp-2',
		'line-clamp-4',
		'line-clamp-3',
		'line-clamp-5',
		'line-clamp-2',
		'line-clamp-4',
		'line-clamp-3'
	];

	function showAll() {
		expanded = true;
	}
</script>

<section class="py-16 sm:py-20">
	<div class="mx-auto max-w-7xl px-6">
		<div class="flex flex-col items-center gap-3 text-center">
			<h2 class="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{heading}</h2>
			<p class="max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
		</div>

		<div class="proof-wrap mt-10">
			<div
				class="proof-cols"
				class:proof-collapsed={hasMore && !expanded}
				style={`--collapsed-height: ${collapsedHeight};`}
			>
				{#each testimonials as testimonial, idx (testimonial.id ?? testimonial.name)}
					{@const clamp = clampClasses[idx % clampClasses.length]}
					<div class="proof-item">
						<Card.Root class="break-inside-avoid gap-3.5 p-5">
							<div class="proof-head">
								<div class="proof-who">
									<Avatar.Root class="size-9 rounded-full ring-1 ring-input">
										<Avatar.Image src={testimonial.avatar} alt={testimonial.name} />
										<Avatar.Fallback>{testimonial.name.charAt(0)}</Avatar.Fallback>
									</Avatar.Root>
									<div class="proof-meta">
										<p class="proof-name">{testimonial.name}</p>
										{#if testimonial.role}
											<p class="proof-role">{testimonial.role}</p>
										{/if}
									</div>
								</div>
								{#if testimonial.source}
									<span
										class="proof-source"
										title={`Posted on ${testimonial.source}`}
										aria-label={`Posted on ${testimonial.source}`}
									>
										<BrandLogo source={testimonial.source} class="size-4" />
									</span>
								{/if}
							</div>
							<p class={`proof-quote ${expanded ? '' : clamp}`}>{testimonial.content}</p>
						</Card.Root>
					</div>
				{/each}
			</div>

			{#if hasMore && !expanded}
				<div class="proof-reveal">
					<Button variant="secondary" onclick={showAll}>{showMoreLabel}</Button>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.proof-wrap {
		position: relative;
	}

	.proof-cols {
		columns: 1;
		column-gap: 1.25rem;
	}

	.proof-collapsed {
		max-height: var(--collapsed-height);
		overflow: hidden;
	}

	.proof-item {
		break-inside: avoid;
		margin-bottom: 1.25rem;
	}

	.proof-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.proof-who {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.proof-meta {
		line-height: 1.25;
	}

	.proof-name {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.proof-role {
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}

	.proof-source {
		display: inline-flex;
		color: var(--muted-foreground);
		transition: color 140ms ease;
	}

	.proof-source:hover {
		color: var(--foreground);
	}

	.proof-quote {
		color: color-mix(in oklch, var(--foreground) 62%, transparent);
		font-size: 0.95rem;
		line-height: 1.75;
	}

	.proof-reveal {
		position: absolute;
		inset-inline: 0;
		bottom: 0;
		display: flex;
		align-items: end;
		justify-content: center;
		padding-bottom: 1.5rem;
		padding-top: 6rem;
		background: linear-gradient(
			to top,
			var(--background),
			color-mix(in oklch, var(--background) 72%, transparent) 60%,
			transparent
		);
	}

	@media (min-width: 768px) {
		.proof-cols {
			columns: 2;
		}
	}

	@media (min-width: 1024px) {
		.proof-cols {
			columns: 3;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.proof-collapsed {
			max-height: none;
			overflow: visible;
		}
	}
</style>
