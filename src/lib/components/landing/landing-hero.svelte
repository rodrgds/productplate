<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import Code2Icon from '@lucide/svelte/icons/code-2';
	import Layers3Icon from '@lucide/svelte/icons/layers-3';
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	interface HeroAction {
		label: string;
		href: string;
		variant?: 'default' | 'outline' | 'secondary' | 'ghost';
	}

	interface HeroStat {
		value: string;
		label: string;
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		actions?: readonly HeroAction[];
		stats?: readonly HeroStat[];
	}

	let {
		kicker = 'Plug-and-play Svelte sections',
		title = 'Landing component library',
		description = 'A catalog of production-minded marketing sections for SaaS starters: heroes, proof, feature systems, pricing, FAQs, CTAs, and motion patterns that live in your repo.',
		actions = [
			{ label: 'Use the components', href: resolve('/auth/sign-up') },
			{
				label: 'View source',
				href: 'https://github.com/rodrgds/productplate',
				variant: 'outline'
			}
		],
		stats = [
			{ value: '16', label: 'source components' },
			{ value: '3', label: 'reference systems' },
			{ value: 'AA', label: 'accessibility target' }
		]
	}: Props = $props();

	const checklist = [
		{ label: 'Hero + social proof', status: 'ready' },
		{ label: 'Bento feature system', status: 'adapted' },
		{ label: 'Mosaic testimonials', status: 'ready' },
		{ label: 'Pricing + FAQ close', status: 'ready' }
	] as const;

	const bars = [42, 58, 47, 68, 62, 86, 74, 92] as const;
</script>

<section class="relative overflow-hidden border-b">
	<div class="landing-component-grid pointer-events-none absolute inset-0 opacity-70"></div>
	<div
		class="mx-auto grid max-w-7xl gap-14 px-6 py-20 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-28"
	>
		<div class="relative">
			<Badge variant="outline">
				<Layers3Icon />
				{kicker}
			</Badge>
			<h1
				class="mt-7 max-w-3xl text-5xl leading-[0.98] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
			>
				{title}
			</h1>
			<p class="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>
			<div class="mt-9 flex flex-wrap gap-3">
				{#each actions as action (action.label)}
					<Button href={action.href} variant={action.variant ?? 'default'} size="lg">
						{#if action.variant === 'outline'}
							<Code2Icon data-icon="inline-start" />
						{/if}
						{action.label}
						{#if action.variant !== 'outline'}
							<ArrowRightIcon data-icon="inline-end" />
						{/if}
					</Button>
				{/each}
			</div>
			<div class="mt-10 grid max-w-xl grid-cols-3 border-y">
				{#each stats as stat (stat.label)}
					<div class="py-4 pr-4 not-last:mr-4 not-last:border-r">
						<p class="text-2xl font-semibold tracking-tight">{stat.value}</p>
						<p class="mt-1 text-xs text-muted-foreground">{stat.label}</p>
					</div>
				{/each}
			</div>
		</div>

		<div class="preview-shell">
			<div class="flex h-11 items-center border-b px-4">
				<div class="flex gap-1.5">
					<span class="size-2 rounded-full bg-muted-foreground/25"></span>
					<span class="size-2 rounded-full bg-muted-foreground/25"></span>
					<span class="size-2 rounded-full bg-muted-foreground/25"></span>
				</div>
				<span class="mx-auto pr-9 text-xs text-muted-foreground"
					>landing-components/+page.svelte</span
				>
			</div>

			<div class="grid gap-4 p-4 sm:p-5 lg:grid-cols-[0.86fr_1.14fr]">
				<div class="rounded-xl border bg-muted/35 p-4">
					<div class="flex items-center justify-between gap-3">
						<p class="text-sm font-semibold">Section stack</p>
						<Badge variant="secondary">Source-owned</Badge>
					</div>
					<div class="mt-4 grid gap-3">
						{#each checklist as item (item.label)}
							<div
								class="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm"
							>
								<span
									class="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
								>
									<CheckIcon class="size-3" />
								</span>
								<span class="min-w-0 flex-1 truncate">{item.label}</span>
								<span class="text-xs text-muted-foreground">{item.status}</span>
							</div>
						{/each}
					</div>
				</div>

				<div class="grid gap-4">
					<div class="rounded-xl border bg-card p-4 shadow-sm">
						<div class="flex items-center justify-between gap-3">
							<div>
								<p class="text-sm font-semibold">Campaign health</p>
								<p class="mt-1 text-xs text-muted-foreground">Ready for private beta</p>
							</div>
							<Badge variant="secondary">Live</Badge>
						</div>
						<div class="mt-5 flex h-28 items-end gap-2">
							{#each bars as value, index (index)}
								<div
									class="min-w-2 flex-1 rounded-t-sm bg-primary"
									style={`height: ${value}%`}
								></div>
							{/each}
						</div>
					</div>

					<div class="rounded-xl border bg-background p-4">
						<p class="text-sm font-semibold">Conversion path</p>
						<div class="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
							{#each ['Visit', 'Compare', 'Signup'] as step (step)}
								<div class="rounded-lg border bg-muted/35 px-2 py-3">{step}</div>
							{/each}
						</div>
						<p class="mt-4 text-sm leading-6 text-muted-foreground">
							Use the page as a component catalog, then copy only the sections your boilerplate
							users need.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.landing-component-grid {
		background-image:
			linear-gradient(
				to right,
				color-mix(in oklch, var(--border) 55%, transparent) 1px,
				transparent 1px
			),
			linear-gradient(
				to bottom,
				color-mix(in oklch, var(--border) 55%, transparent) 1px,
				transparent 1px
			);
		background-size: 44px 44px;
		mask-image: linear-gradient(to bottom, black 0%, transparent 82%);
	}

	.preview-shell {
		position: relative;
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
		box-shadow: 0 24px 50px color-mix(in oklch, var(--foreground) 6%, transparent);
	}
</style>
