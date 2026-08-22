<script lang="ts">
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import { Badge } from '$lib/components/ui/badge';

	type SlideMode = 'hover' | 'drag';

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		firstImage?: string;
		secondImage?: string;
		firstImageAlt?: string;
		secondImageAlt?: string;
		initialSliderPercentage?: number;
		slideMode?: SlideMode;
		showHandlebar?: boolean;
	}

	let {
		kicker = 'Image comparison',
		title = 'Let visitors scrub the before and after instead of reading a spreadsheet.',
		description = 'Ported from Aceternity’s Compare component: a clipped image layer with a pointer-driven slider, drag or hover modes, and a keyboard-friendly handle.',
		firstImage = 'https://assets.aceternity.com/code-problem.png',
		secondImage = 'https://assets.aceternity.com/code-solution.png',
		firstImageAlt = 'Before screenshot with messy implementation details',
		secondImageAlt = 'After screenshot with cleaner implementation details',
		initialSliderPercentage = 54,
		slideMode = 'drag',
		showHandlebar = true
	}: Props = $props();

	let sliderRef: HTMLDivElement | undefined = $state();
	let sliderXPercent = $state(getInitialSliderPercentage());
	let isDragging = $state(false);

	const scrubLabel = $derived(
		slideMode === 'drag' ? 'Drag the handle to compare' : 'Move across the image to compare'
	);

	function clampPercentage(value: number) {
		return Math.max(0, Math.min(100, value));
	}

	function getInitialSliderPercentage() {
		return initialSliderPercentage;
	}

	function updateSlider(clientX: number) {
		if (!sliderRef) return;

		const rect = sliderRef.getBoundingClientRect();
		const nextPercent = ((clientX - rect.left) / rect.width) * 100;
		sliderXPercent = clampPercentage(nextPercent);
	}

	function handlePointerDown(event: PointerEvent) {
		if (slideMode === 'drag') {
			isDragging = true;
			if (event.currentTarget instanceof HTMLElement) {
				event.currentTarget.setPointerCapture(event.pointerId);
			}
		}

		updateSlider(event.clientX);
	}

	function handlePointerMove(event: PointerEvent) {
		if (slideMode === 'hover' || isDragging) {
			updateSlider(event.clientX);
		}
	}

	function handlePointerUp(event: PointerEvent) {
		isDragging = false;
		if (event.currentTarget instanceof HTMLElement) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	}

	function handlePointerLeave() {
		isDragging = false;

		if (slideMode === 'hover') {
			sliderXPercent = getInitialSliderPercentage();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			sliderXPercent = clampPercentage(sliderXPercent - 4);
		}

		if (event.key === 'ArrowRight') {
			event.preventDefault();
			sliderXPercent = clampPercentage(sliderXPercent + 4);
		}
	}
</script>

<section class="py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
			<div>
				<Badge variant="outline">{kicker}</Badge>
				<h2 class="mt-5 max-w-2xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
					{title}
				</h2>
				<p class="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{description}</p>
			</div>

			<div class="compare-shell">
				<div class="compare-heading">
					<span>Before</span>
					<span>{scrubLabel}</span>
					<span>After</span>
				</div>

				<div
					bind:this={sliderRef}
					class={['compare-frame', isDragging ? 'is-dragging' : ''].filter(Boolean).join(' ')}
					role="slider"
					tabindex="0"
					aria-label="Before and after product comparison"
					aria-valuemin="0"
					aria-valuemax="100"
					aria-valuenow={Math.round(sliderXPercent)}
					onpointerdown={handlePointerDown}
					onpointermove={handlePointerMove}
					onpointerup={handlePointerUp}
					onpointercancel={handlePointerUp}
					onpointerleave={handlePointerLeave}
					onkeydown={handleKeydown}
				>
					<img
						class="compare-image compare-image-after"
						src={secondImage}
						alt={secondImageAlt}
						draggable="false"
						loading="lazy"
						decoding="async"
					/>
					<div
						class="compare-image-before"
						style={`clip-path: inset(0 ${100 - sliderXPercent}% 0 0);`}
					>
						<img
							class="compare-image"
							src={firstImage}
							alt={firstImageAlt}
							draggable="false"
							loading="lazy"
							decoding="async"
						/>
					</div>

					<div class="compare-divider" style={`left: ${sliderXPercent}%;`} aria-hidden="true">
						<span class="compare-glow compare-glow-wide"></span>
						<span class="compare-glow compare-glow-tight"></span>
						{#if showHandlebar}
							<span class="compare-handle">
								<GripVerticalIcon class="size-4" />
							</span>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.compare-shell {
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1.25rem;
		background: color-mix(in oklch, var(--muted) 48%, var(--background));
		padding: 0.75rem;
		box-shadow:
			0 1px 2px color-mix(in oklch, var(--foreground) 5%, transparent),
			0 24px 60px color-mix(in oklch, var(--foreground) 8%, transparent);
	}

	.compare-heading {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 0.75rem;
		padding: 0.2rem 0.25rem 0.75rem;
		color: var(--muted-foreground);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0;
		text-transform: uppercase;
	}

	.compare-heading span:nth-child(2) {
		text-align: center;
		text-transform: none;
	}

	.compare-heading span:last-child {
		text-align: right;
	}

	.compare-frame {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		height: clamp(20rem, 52vw, 35rem);
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--background);
		cursor: grab;
		touch-action: none;
		outline: none;
		user-select: none;
	}

	.compare-frame:focus-visible {
		box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 28%, transparent);
	}

	.compare-frame.is-dragging {
		cursor: grabbing;
	}

	.compare-image,
	.compare-image-before {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.compare-image {
		object-fit: cover;
		object-position: left top;
		pointer-events: none;
	}

	.compare-image-after {
		z-index: 1;
	}

	.compare-image-before {
		z-index: 2;
		overflow: hidden;
		border-radius: inherit;
		will-change: clip-path;
	}

	.compare-divider {
		position: absolute;
		z-index: 4;
		top: 0;
		bottom: 0;
		width: 1px;
		background: linear-gradient(to bottom, transparent 4%, var(--primary) 50%, transparent 96%);
		transform: translateX(-0.5px);
	}

	.compare-glow {
		position: absolute;
		top: 50%;
		left: 0;
		pointer-events: none;
		transform: translateY(-50%);
	}

	.compare-glow-wide {
		width: 9rem;
		height: 100%;
		background: linear-gradient(
			to right,
			color-mix(in oklch, var(--primary) 28%, transparent),
			transparent
		);
		mask-image: radial-gradient(110px at left, black, transparent);
		-webkit-mask-image: radial-gradient(110px at left, black, transparent);
		opacity: 0.55;
	}

	.compare-glow-tight {
		width: 2.5rem;
		height: 64%;
		background: linear-gradient(
			to right,
			color-mix(in oklch, var(--foreground) 22%, transparent),
			transparent
		);
		mask-image: radial-gradient(60px at left, black, transparent);
		-webkit-mask-image: radial-gradient(60px at left, black, transparent);
	}

	.compare-handle {
		position: absolute;
		top: 50%;
		right: -1rem;
		display: inline-flex;
		width: 2rem;
		height: 2rem;
		align-items: center;
		justify-content: center;
		border: 1px solid color-mix(in oklch, var(--border) 74%, var(--background));
		border-radius: 0.65rem;
		background: color-mix(in oklch, var(--background) 96%, transparent);
		color: var(--foreground);
		box-shadow:
			0 0 0 1px color-mix(in oklch, var(--foreground) 5%, transparent),
			0 12px 24px color-mix(in oklch, var(--foreground) 18%, transparent);
		transform: translateY(-50%);
	}

	@media (prefers-reduced-motion: reduce) {
		.compare-frame,
		.compare-image-before {
			scroll-behavior: auto;
		}
	}
</style>
