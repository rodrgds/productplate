<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import Code2Icon from '@lucide/svelte/icons/code-2';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		title?: string;
		description?: string;
		primaryLabel?: string;
		primaryHref?: string;
		secondaryLabel?: string;
		secondaryHref?: string;
	}

	let {
		title = 'Start with a page that already knows the usual objections.',
		description = 'Use the sections as-is, trim them down, or move them into your own product route. They are source files, not a black box.',
		primaryLabel = 'Start building',
		primaryHref = resolve('/auth/sign-up'),
		secondaryLabel = 'View source',
		secondaryHref = 'https://github.com/rodrgds/productplate'
	}: Props = $props();
</script>

<section class="py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="cta-shell">
			<div>
				<h2 class="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
					{title}
				</h2>
				<p class="mt-5 max-w-2xl text-base leading-7 text-primary-foreground/75">
					{description}
				</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<Button href={primaryHref} variant="secondary" size="lg">
					{primaryLabel}
					<ArrowRightIcon data-icon="inline-end" />
				</Button>
				<Button href={secondaryHref} variant="secondary" size="lg">
					<Code2Icon data-icon="inline-start" />
					{secondaryLabel}
				</Button>
			</div>
		</div>
	</div>
</section>

<style>
	:global(.cta-shell) {
		position: relative;
		overflow: hidden;
		display: grid;
		gap: 2rem;
		align-items: center;
		border-radius: 1rem;
		background: var(--primary);
		color: var(--primary-foreground);
		padding: clamp(2rem, 5vw, 4rem);
	}

	:global(.cta-shell) > * {
		position: relative;
		z-index: 1;
	}

	@media (min-width: 1024px) {
		:global(.cta-shell) {
			grid-template-columns: 1fr auto;
		}
	}
</style>
