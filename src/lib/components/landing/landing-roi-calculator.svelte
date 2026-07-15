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
		kicker = 'Build the business case',
		title = 'Turn a vague efficiency claim into a number buyers can test.',
		description = 'Use a grounded calculator when the value of your product changes with team size, time spent, or operating cost.',
		teamSize = $bindable(12),
		hoursPerWeek = $bindable(4),
		hourlyCost = $bindable(65),
		recoveryRate = 0.65,
		ctaLabel = 'See your savings plan',
		ctaHref = '/auth/sign-up'
	}: Props = $props();

	const weeklyHours = $derived(teamSize * hoursPerWeek);
	const annualHoursRecovered = $derived(Math.round(weeklyHours * 52 * recoveryRate));
	const annualSavings = $derived(Math.round(annualHoursRecovered * hourlyCost));
	const monthlySavings = $derived(Math.round(annualSavings / 12));

	const currency = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});
</script>

<section class="border-b py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="roi-heading">
			<div>
				<Badge variant="outline">
					<CoinsIcon />
					{kicker}
				</Badge>
				<h2>{title}</h2>
			</div>
			<p>{description}</p>
		</div>

		<div class="calculator-shell mt-12">
			<div class="calculator-inputs">
				<div class="input-heading">
					<div>
						<p>Estimate your current cost</p>
						<span>Adjust the inputs to match one recurring workflow.</span>
					</div>
					<Badge variant="secondary">Live estimate</Badge>
				</div>

				<div class="slider-fields">
					<div class="slider-field">
						<div class="field-label">
							<span class="field-icon"><UsersIcon class="size-4" /></span>
							<div>
								<label for="roi-team-size">People doing the work</label>
								<p>Anyone who repeats this workflow</p>
							</div>
							<strong>{teamSize}</strong>
						</div>
						<Slider
							id="roi-team-size"
							type="single"
							bind:value={teamSize}
							min={1}
							max={50}
							step={1}
							aria-label="People doing the work"
						/>
						<div class="range-labels"><span>1</span><span>50</span></div>
					</div>

					<div class="slider-field">
						<div class="field-label">
							<span class="field-icon"><ClockIcon class="size-4" /></span>
							<div>
								<label for="roi-hours">Hours per person, weekly</label>
								<p>Meetings, updates, and manual handoffs</p>
							</div>
							<strong>{hoursPerWeek}h</strong>
						</div>
						<Slider
							id="roi-hours"
							type="single"
							bind:value={hoursPerWeek}
							min={1}
							max={20}
							step={1}
							aria-label="Hours per person each week"
						/>
						<div class="range-labels"><span>1 hour</span><span>20 hours</span></div>
					</div>

					<div class="slider-field">
						<div class="field-label">
							<span class="field-icon"><CoinsIcon class="size-4" /></span>
							<div>
								<label for="roi-cost">Blended hourly cost</label>
								<p>Salary, overhead, and operating cost</p>
							</div>
							<strong>{currency.format(hourlyCost)}</strong>
						</div>
						<Slider
							id="roi-cost"
							type="single"
							bind:value={hourlyCost}
							min={25}
							max={200}
							step={5}
							aria-label="Blended hourly cost"
						/>
						<div class="range-labels"><span>$25</span><span>$200</span></div>
					</div>
				</div>
			</div>

			<div class="calculator-result" aria-live="polite">
				<div>
					<p class="text-xs font-medium tracking-wide uppercase">Estimated annual value</p>
					<strong class="result-total">{currency.format(annualSavings)}</strong>
					<p class="result-explainer">
						Based on recovering {Math.round(recoveryRate * 100)}% of the time spent on this
						workflow.
					</p>
				</div>

				<div class="result-equation">
					<div><span>{teamSize} people</span><small>team</small></div>
					<b>×</b>
					<div><span>{hoursPerWeek} hours</span><small>weekly</small></div>
					<b>×</b>
					<div><span>{currency.format(hourlyCost)}</span><small>per hour</small></div>
				</div>

				<div class="result-details">
					<div>
						<span>Time returned</span>
						<strong>{annualHoursRecovered.toLocaleString()} hours / year</strong>
					</div>
					<div>
						<span>Monthly value</span>
						<strong>{currency.format(monthlySavings)} / month</strong>
					</div>
				</div>

				<Button href={ctaHref} size="lg" class="mt-8 w-full">
					{ctaLabel}
					<ArrowRightIcon data-icon="inline-end" />
				</Button>
				<p class="mt-3 text-center text-xs text-muted-foreground">
					No email required to calculate.
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	.roi-heading {
		display: grid;
		gap: 2rem;
		align-items: end;
	}

	.roi-heading h2 {
		max-width: 42rem;
		margin-top: 1.25rem;
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 650;
		line-height: 1.02;
		letter-spacing: -0.045em;
		text-wrap: balance;
	}

	.roi-heading > p {
		max-width: 36rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}

	.calculator-shell {
		display: grid;
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
	}

	.calculator-inputs,
	.calculator-result {
		padding: clamp(1.25rem, 4vw, 2.5rem);
	}

	.input-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.input-heading p {
		font-size: 1rem;
		font-weight: 650;
	}

	.input-heading span {
		display: block;
		margin-top: 0.35rem;
		font-size: 0.8rem;
		color: var(--muted-foreground);
	}

	.slider-fields {
		display: grid;
		gap: 1.75rem;
		margin-top: 2.25rem;
	}

	.slider-field {
		display: grid;
		gap: 1rem;
	}

	.field-label {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.75rem;
	}

	.field-icon {
		display: grid;
		size: 2.25rem;
		place-items: center;
		border-radius: 0.65rem;
		background: var(--muted);
		color: var(--primary);
	}

	.field-label label {
		display: block;
		font-size: 0.82rem;
		font-weight: 650;
	}

	.field-label p,
	.range-labels {
		font-size: 0.7rem;
		color: var(--muted-foreground);
	}

	.field-label p {
		margin-top: 0.2rem;
	}

	.field-label > strong {
		font-size: 0.9rem;
		font-weight: 700;
	}

	.range-labels {
		display: flex;
		justify-content: space-between;
	}

	.calculator-result {
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		background: var(--foreground);
		color: var(--background);
	}

	.result-total {
		display: block;
		margin-top: 1rem;
		font-size: clamp(3rem, 7vw, 5rem);
		font-weight: 650;
		line-height: 0.95;
		letter-spacing: -0.055em;
	}

	.result-explainer {
		max-width: 31rem;
		margin-top: 1rem;
		font-size: 0.82rem;
		line-height: 1.65;
		opacity: 0.68;
	}

	.result-equation {
		display: grid;
		grid-template-columns: 1fr auto 1fr auto 1fr;
		align-items: center;
		gap: 0.5rem;
		margin-top: 2rem;
		border-block: 1px solid color-mix(in oklch, var(--background) 18%, transparent);
		padding-block: 1.25rem;
	}

	.result-equation div {
		text-align: center;
	}

	.result-equation span,
	.result-equation small {
		display: block;
	}

	.result-equation span {
		font-size: 0.8rem;
		font-weight: 650;
	}

	.result-equation small {
		margin-top: 0.25rem;
		font-size: 0.65rem;
		opacity: 0.58;
	}

	.result-equation b {
		font-size: 0.75rem;
		opacity: 0.42;
	}

	.result-details {
		display: grid;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.result-details div {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}

	.result-details span {
		font-size: 0.72rem;
		opacity: 0.58;
	}

	.result-details strong {
		font-size: 0.8rem;
		font-weight: 650;
	}

	@media (min-width: 900px) {
		.roi-heading {
			grid-template-columns: 1fr 0.72fr;
		}

		.calculator-shell {
			grid-template-columns: minmax(0, 1.12fr) minmax(22rem, 0.88fr);
		}
	}

	@media (max-width: 480px) {
		.field-label {
			grid-template-columns: auto minmax(0, 1fr);
		}

		.field-label > strong {
			grid-column: 2;
		}
	}
</style>
