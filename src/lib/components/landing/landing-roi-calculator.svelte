<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ClockIcon from '@lucide/svelte/icons/clock-3';
	import CoinsIcon from '@lucide/svelte/icons/coins';
	import UsersIcon from '@lucide/svelte/icons/users';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/slider';

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		teamSize?: number;
		hoursPerWeek?: number;
		hourlyCost?: number;
		recoveryRate?: number;
		ctaLabel?: string;
		ctaHref?: string;
	}

	let {
		kicker = 'A business case you can challenge',
		title = 'Put your own numbers behind the promise.',
		description = 'Three assumptions, one transparent calculation. Buyers can adjust the model without handing over an email address.',
		teamSize = $bindable(12),
		hoursPerWeek = $bindable(4),
		hourlyCost = $bindable(65),
		recoveryRate = 0.65,
		ctaLabel = 'Build the full business case',
		ctaHref = '/auth/sign-up'
	}: Props = $props();

	const weeklyHours = $derived(teamSize * hoursPerWeek);
	const annualHoursRecovered = $derived(Math.round(weeklyHours * 52 * recoveryRate));
	const annualSavings = $derived(Math.round(annualHoursRecovered * hourlyCost));
	const monthlySavings = $derived(Math.round(annualSavings / 12));
	const retainedHours = $derived(Math.round(weeklyHours * (1 - recoveryRate)));

	const currency = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});

	const assumptions = $derived([
		{
			id: 'roi-team-size',
			label: 'People repeating the workflow',
			note: 'Across the team',
			value: teamSize,
			formatted: `${teamSize}`,
			min: 1,
			max: 50,
			step: 1,
			icon: UsersIcon
		},
		{
			id: 'roi-hours',
			label: 'Hours lost per person',
			note: 'Every week',
			value: hoursPerWeek,
			formatted: `${hoursPerWeek}h`,
			min: 1,
			max: 20,
			step: 1,
			icon: ClockIcon
		},
		{
			id: 'roi-cost',
			label: 'Blended hourly cost',
			note: 'Salary plus overhead',
			value: hourlyCost,
			formatted: currency.format(hourlyCost),
			min: 25,
			max: 200,
			step: 5,
			icon: CoinsIcon
		}
	]);
</script>

<section class="border-b py-20 sm:py-24" data-testid="roi-calculator">
	<div class="mx-auto max-w-7xl px-6">
		<header class="roi-header">
			<div>
				<Badge variant="outline"><CoinsIcon />{kicker}</Badge>
				<h2>{title}</h2>
			</div>
			<p>{description}</p>
		</header>

		<div class="roi-board">
			<div class="assumption-panel">
				<div class="panel-label">
					<span>Assumptions</span>
					<Badge variant="secondary">Live model</Badge>
				</div>

				<div class="assumption-list">
					{#each assumptions as assumption (assumption.id)}
						<div class="assumption-row">
							<div class="assumption-heading">
								<assumption.icon class="size-4" />
								<div>
									<label for={assumption.id}>{assumption.label}</label>
									<span>{assumption.note}</span>
								</div>
								<strong>{assumption.formatted}</strong>
							</div>

							{#if assumption.id === 'roi-team-size'}
								<Slider
									id={assumption.id}
									type="single"
									bind:value={teamSize}
									min={assumption.min}
									max={assumption.max}
									step={assumption.step}
									aria-label="People doing the work"
								/>
							{:else if assumption.id === 'roi-hours'}
								<Slider
									id={assumption.id}
									type="single"
									bind:value={hoursPerWeek}
									min={assumption.min}
									max={assumption.max}
									step={assumption.step}
									aria-label="Hours per person each week"
								/>
							{:else}
								<Slider
									id={assumption.id}
									type="single"
									bind:value={hourlyCost}
									min={assumption.min}
									max={assumption.max}
									step={assumption.step}
									aria-label="Blended hourly cost"
								/>
							{/if}
							<div class="range-labels">
								<span>{assumption.min}</span><span>{assumption.max}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="return-panel" aria-live="polite">
				<div class="return-topline">
					<span>Estimated annual capacity</span>
					<small>{Math.round(recoveryRate * 100)}% recovery</small>
				</div>

				<strong class="return-total">{currency.format(annualSavings)}</strong>
				<p class="return-caption">of productive time returned each year</p>

				<div class="capacity-bar" aria-label={`${annualHoursRecovered} hours recovered each year`}>
					<span class="capacity-recovered" style={`width: ${recoveryRate * 100}%`}></span>
					<span class="capacity-retained" style={`width: ${(1 - recoveryRate) * 100}%`}></span>
				</div>
				<div class="capacity-legend">
					<span
						><i class="bg-primary"></i>{annualHoursRecovered.toLocaleString()} hours returned</span
					>
					<span><i class="bg-background/25"></i>{retainedHours} hours remain weekly</span>
				</div>

				<p class="equation">
					<span>{teamSize} people</span> × <span>{hoursPerWeek} hours</span> ×
					<span>{currency.format(hourlyCost)}</span>
				</p>

				<div class="return-footer">
					<div>
						<span>Monthly equivalent</span>
						<strong>{currency.format(monthlySavings)}</strong>
					</div>
					<Button href={ctaHref} variant="secondary">
						{ctaLabel}<ArrowRightIcon data-icon="inline-end" />
					</Button>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.roi-header {
		display: grid;
		gap: 2rem;
		align-items: end;
	}

	.roi-header h2 {
		max-width: 42rem;
		margin-top: 1.25rem;
		font-size: clamp(2.25rem, 5vw, 3.75rem);
		font-weight: 650;
		line-height: 0.98;
		letter-spacing: -0.05em;
		text-wrap: balance;
	}

	.roi-header > p {
		max-width: 34rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}

	.roi-board {
		display: grid;
		overflow: hidden;
		margin-top: 3rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
	}

	.assumption-panel,
	.return-panel {
		padding: clamp(1.5rem, 4vw, 3rem);
	}

	.panel-label,
	.return-topline,
	.assumption-heading,
	.return-footer,
	.capacity-legend {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.panel-label > span,
	.return-topline > span {
		font-size: 0.75rem;
		font-weight: 650;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.assumption-list {
		display: grid;
		margin-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.assumption-row {
		padding: 1.35rem 0 1rem;
		border-bottom: 1px solid var(--border);
	}

	.assumption-heading {
		justify-content: flex-start;
	}

	.assumption-heading > :global(svg) {
		flex: none;
		color: var(--primary);
	}

	.assumption-heading > div {
		min-width: 0;
		flex: 1;
	}

	.assumption-heading label,
	.assumption-heading span {
		display: block;
	}

	.assumption-heading label {
		font-size: 0.875rem;
		font-weight: 650;
	}

	.assumption-heading span,
	.range-labels {
		color: var(--muted-foreground);
		font-size: 0.7rem;
	}

	.assumption-heading span {
		margin-top: 0.15rem;
	}

	.assumption-heading strong {
		font-size: 1rem;
		font-variant-numeric: tabular-nums;
	}

	.assumption-row :global([data-slot='slider']) {
		margin-top: 0.8rem;
	}

	.range-labels {
		display: flex;
		justify-content: space-between;
		margin-top: -0.1rem;
	}

	.return-panel {
		display: flex;
		flex-direction: column;
		background: var(--foreground);
		color: var(--background);
	}

	.return-topline small {
		font-size: 0.72rem;
		opacity: 0.6;
	}

	.return-total {
		display: block;
		margin-top: clamp(2.5rem, 7vw, 5rem);
		font-size: clamp(3.5rem, 8vw, 6rem);
		font-weight: 650;
		font-variant-numeric: tabular-nums;
		line-height: 0.88;
		letter-spacing: -0.065em;
	}

	.return-caption {
		margin-top: 1rem;
		font-size: 0.85rem;
		opacity: 0.62;
	}

	.capacity-bar {
		display: flex;
		overflow: hidden;
		height: 0.7rem;
		margin-top: 2.5rem;
		border-radius: 999px;
		background: color-mix(in oklch, var(--background) 16%, transparent);
	}

	.capacity-bar span {
		display: block;
		height: 100%;
	}

	.capacity-recovered {
		background: var(--primary);
	}

	.capacity-retained {
		background: transparent;
	}

	.capacity-legend {
		align-items: flex-start;
		margin-top: 0.75rem;
		font-size: 0.7rem;
		opacity: 0.68;
	}

	.capacity-legend span {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.capacity-legend i {
		display: block;
		size: 0.45rem;
		border-radius: 999px;
	}

	.equation {
		margin-top: 2rem;
		border-block: 1px solid color-mix(in oklch, var(--background) 18%, transparent);
		padding-block: 1.25rem;
		font-size: 0.82rem;
		opacity: 0.72;
	}

	.equation span {
		font-weight: 650;
		color: var(--background);
	}

	.return-footer {
		align-items: end;
		margin-top: auto;
		padding-top: 2rem;
	}

	.return-footer span,
	.return-footer strong {
		display: block;
	}

	.return-footer span {
		font-size: 0.68rem;
		opacity: 0.58;
	}

	.return-footer strong {
		margin-top: 0.2rem;
		font-size: 1rem;
	}

	@media (min-width: 900px) {
		.roi-header {
			grid-template-columns: 1fr 0.72fr;
		}

		.roi-board {
			grid-template-columns: minmax(0, 0.92fr) minmax(25rem, 1.08fr);
		}
	}

	@media (max-width: 560px) {
		.capacity-legend,
		.return-footer {
			align-items: flex-start;
			flex-direction: column;
		}

		.return-footer :global(a) {
			width: 100%;
		}
	}
</style>
