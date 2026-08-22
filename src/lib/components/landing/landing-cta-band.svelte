<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		title?: string;
		description?: string;
		image?: string;
		imageAlt?: string;
		primaryLabel?: string;
		primaryHref?: string;
		secondaryLabel?: string;
		secondaryHref?: string;
	}

	let {
		title = 'A foundation ready for your product.',
		description = 'Auth, billing, realtime data, AI, and a full component system. Built for founders who would rather work on the idea.',
		image = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
		imageAlt = 'Product dashboard preview',
		primaryLabel = 'Use demo account',
		primaryHref = resolve('/auth/demo'),
		secondaryLabel = 'Browse components',
		secondaryHref = resolve('/components')
	}: Props = $props();
</script>

<section class="py-16 sm:py-20">
	<div class="mx-auto max-w-7xl px-6">
		<div class="cta-band">
			<div class="cta-text">
				<h2 class="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h2>
				<p class="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{description}</p>
				<div class="mt-6 flex flex-wrap gap-3">
					<Button href={primaryHref} size="lg">
						{primaryLabel}
						<ArrowRightIcon data-icon="inline-end" />
					</Button>
					<Button href={secondaryHref} variant="outline" size="lg">{secondaryLabel}</Button>
				</div>
			</div>
			<div class="cta-media" aria-hidden="true">
				<img src={image} alt={imageAlt} loading="lazy" decoding="async" />
			</div>
		</div>
	</div>
</section>

<style>
	.cta-band {
		display: grid;
		gap: 1.5rem;
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
		box-shadow: 0 1px 2px color-mix(in oklch, var(--foreground) 5%, transparent);
	}

	.cta-text {
		display: grid;
		align-content: center;
		padding: 2rem;
	}

	.cta-media {
		position: relative;
		min-height: 14rem;
		overflow: hidden;
		background: var(--muted);
	}

	.cta-media img {
		width: 100%;
		height: 100%;
		min-height: 14rem;
		object-fit: cover;
	}

	@media (min-width: 880px) {
		.cta-band {
			grid-template-columns: 1fr 0.85fr;
		}

		.cta-media {
			min-height: 100%;
		}
	}
</style>
