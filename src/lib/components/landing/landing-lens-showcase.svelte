<script lang="ts">
	import SearchIcon from '@lucide/svelte/icons/search';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		image?: string;
		imageAlt?: string;
		zoomFactor?: number;
		lensSize?: number;
	}

	let {
		kicker = 'Lens',
		title = 'A magnified preview for dense UI.',
		description = 'Hover to zoom into the detail layer.',
		image = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80',
		imageAlt = 'Analytics dashboard on a laptop screen',
		zoomFactor = 1.65,
		lensSize = 170
	}: Props = $props();

	let isHovering = $state(false);
	let position = $state({ x: 260, y: 180 });

	function handlePointerMove(event: PointerEvent) {
		if (!(event.currentTarget instanceof HTMLElement)) return;
		const rect = event.currentTarget.getBoundingClientRect();
		position = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}
</script>

<section class="py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
			<div>
				<Badge variant="outline">{kicker}</Badge>
				<h2 class="mt-5 max-w-2xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
					{title}
				</h2>
				<p class="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{description}</p>
			</div>

			<div
				class="lens-card"
				role="region"
				aria-label="Magnified product image"
				style={`--lens-x: ${position.x}px; --lens-y: ${position.y}px; --lens-size: ${lensSize}px; --lens-scale: ${zoomFactor};`}
				onpointerenter={() => (isHovering = true)}
				onpointerleave={() => (isHovering = false)}
				onpointermove={handlePointerMove}
			>
				<img src={image} alt={imageAlt} loading="lazy" decoding="async" />
				{#if isHovering}
					<div class="lens-layer" aria-hidden="true">
						<img src={image} alt="" />
					</div>
				{/if}
				<div class="lens-label">
					<SearchIcon class="size-4" />
					<span>Hover to inspect</span>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.lens-card {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1.25rem;
		background: var(--muted);
		box-shadow: 0 18px 56px color-mix(in oklch, var(--foreground) 10%, transparent);
		outline: none;
	}

	.lens-card > img,
	.lens-layer img {
		display: block;
		width: 100%;
		aspect-ratio: 16 / 10;
		object-fit: cover;
	}

	.lens-layer {
		position: absolute;
		z-index: 2;
		inset: 0;
		overflow: hidden;
		mask-image: radial-gradient(
			circle calc(var(--lens-size) / 2) at var(--lens-x) var(--lens-y),
			black 100%,
			transparent 100%
		);
		-webkit-mask-image: radial-gradient(
			circle calc(var(--lens-size) / 2) at var(--lens-x) var(--lens-y),
			black 100%,
			transparent 100%
		);
		transform-origin: var(--lens-x) var(--lens-y);
		animation: lens-in 120ms ease both;
	}

	.lens-layer img {
		height: 100%;
		transform: scale(var(--lens-scale));
		transform-origin: var(--lens-x) var(--lens-y);
	}

	.lens-layer::after {
		content: '';
		position: absolute;
		inset: calc(var(--lens-y) - (var(--lens-size) / 2)) auto auto
			calc(var(--lens-x) - (var(--lens-size) / 2));
		width: var(--lens-size);
		height: var(--lens-size);
		border: 1px solid color-mix(in oklch, white 64%, transparent);
		border-radius: 999px;
		box-shadow:
			0 0 0 1px color-mix(in oklch, black 18%, transparent),
			0 16px 36px color-mix(in oklch, black 28%, transparent);
	}

	.lens-label {
		position: absolute;
		z-index: 3;
		right: 1rem;
		bottom: 1rem;
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		border: 1px solid color-mix(in oklch, white 22%, transparent);
		border-radius: 999px;
		background: color-mix(in oklch, black 44%, transparent);
		padding: 0.45rem 0.75rem;
		color: white;
		font-size: 0.78rem;
		font-weight: 700;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	@keyframes lens-in {
		from {
			opacity: 0;
			transform: scale(0.96);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.lens-layer {
			animation: none;
		}
	}
</style>
