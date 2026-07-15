<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	interface ComparisonItem {
		title: string;
		description: string;
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		beforeLabel?: string;
		afterLabel?: string;
		problems?: readonly ComparisonItem[];
		outcomes?: readonly ComparisonItem[];
		ctaLabel?: string;
		ctaHref?: string;
	}

	let {
		kicker = 'A calmer operating model',
		title = 'Replace scattered follow-up with a system that closes the loop.',
		description = 'Make the contrast concrete. This section frames the cost of the old workflow, then shows the exact operating change your product creates.',
		beforeLabel = 'Without your product',
		afterLabel = 'With your product',
		problems = [
			{
				title: 'Requests arrive everywhere',
				description: 'Important context is split across inboxes, docs, and chat.'
			},
			{
				title: 'Owners chase updates',
				description: 'Status reporting steals time from the work itself.'
			},
			{
				title: 'Decisions disappear',
				description: 'The team repeats conversations because the record is incomplete.'
			}
		],
		outcomes = [
			{
				title: 'One intake path',
				description: 'Every request arrives with the context and priority it needs.'
			},
			{
				title: 'Progress stays current',
				description: 'Automations update owners and stakeholders as work moves.'
			},
			{
				title: 'A durable decision trail',
				description: 'Rationale remains attached to the work that came from it.'
			}
		],
		ctaLabel = 'See the workflow',
		ctaHref = '#workflow'
	}: Props = $props();
</script>

<section class="border-b py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
			<div>
				<Badge variant="outline">{kicker}</Badge>
				<h2 class="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
					{title}
				</h2>
			</div>
			<div class="max-w-2xl lg:justify-self-end">
				<p class="text-base leading-7 text-muted-foreground">{description}</p>
				<Button href={ctaHref} variant="link" class="mt-3 px-0">
					{ctaLabel}
					<ArrowRightIcon data-icon="inline-end" />
				</Button>
			</div>
		</div>

		<div class="comparison-frame mt-12">
			<div class="comparison-side comparison-before">
				<div class="comparison-heading">
					<span class="comparison-icon bg-destructive/10 text-destructive">
						<XIcon class="size-4" />
					</span>
					<div>
						<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">Before</p>
						<h3 class="mt-1 text-xl font-semibold">{beforeLabel}</h3>
					</div>
				</div>
				<div class="comparison-list">
					{#each problems as item, index (item.title)}
						<article>
							<span>{String(index + 1).padStart(2, '0')}</span>
							<div>
								<h4>{item.title}</h4>
								<p>{item.description}</p>
							</div>
						</article>
					{/each}
				</div>
			</div>

			<div class="comparison-pivot" aria-hidden="true">
				<ArrowRightIcon class="size-4" />
			</div>

			<div class="comparison-side comparison-after">
				<div class="comparison-heading">
					<span class="comparison-icon bg-primary text-primary-foreground">
						<CheckIcon class="size-4" />
					</span>
					<div>
						<p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">After</p>
						<h3 class="mt-1 text-xl font-semibold">{afterLabel}</h3>
					</div>
				</div>
				<div class="comparison-list">
					{#each outcomes as item, index (item.title)}
						<article>
							<span>{String(index + 1).padStart(2, '0')}</span>
							<div>
								<h4>{item.title}</h4>
								<p>{item.description}</p>
							</div>
						</article>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.comparison-frame {
		position: relative;
		display: grid;
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
	}

	.comparison-side {
		padding: clamp(1.5rem, 4vw, 3rem);
	}

	.comparison-before {
		background: var(--muted);
	}

	.comparison-after {
		background: var(--background);
	}

	.comparison-heading {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.comparison-icon {
		display: grid;
		size: 2.5rem;
		flex: none;
		place-items: center;
		border-radius: 999px;
	}

	.comparison-list {
		margin-top: 2rem;
		border-top: 1px solid var(--border);
	}

	.comparison-list article {
		display: grid;
		grid-template-columns: 2rem minmax(0, 1fr);
		gap: 0.75rem;
		border-bottom: 1px solid var(--border);
		padding: 1.25rem 0;
	}

	.comparison-list article:last-child {
		border-bottom: 0;
	}

	.comparison-list span {
		padding-top: 0.15rem;
		font-size: 0.72rem;
		font-weight: 650;
		color: var(--muted-foreground);
	}

	.comparison-list h4 {
		font-size: 0.95rem;
		font-weight: 650;
	}

	.comparison-list p {
		margin-top: 0.3rem;
		color: var(--muted-foreground);
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.comparison-pivot {
		position: absolute;
		top: 50%;
		left: 50%;
		display: none;
		size: 2.5rem;
		place-items: center;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--background);
		box-shadow: 0 8px 20px color-mix(in oklch, var(--foreground) 10%, transparent);
		transform: translate(-50%, -50%);
	}

	@media (min-width: 768px) {
		.comparison-frame {
			grid-template-columns: 1fr 1fr;
		}

		.comparison-pivot {
			display: grid;
		}
	}
</style>
