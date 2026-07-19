<script lang="ts">
	interface Stat {
		value: string;
		label: string;
	}

	interface Props {
		heading?: string;
		description?: string;
		stats?: readonly Stat[];
	}

	let {
		heading = 'In numbers',
		description = 'Example layout. Replace these sample values with current figures from a named source.',
		stats = [
			{ value: '+1,200', label: 'GitHub stars' },
			{ value: '22M', label: 'Active users' },
			{ value: '+500', label: 'Apps powered' }
		]
	}: Props = $props();
</script>

<section class="py-16 sm:py-20">
	<div class="mx-auto max-w-7xl px-6">
		<div class="mb-10 max-w-2xl">
			<h2 class="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{heading}</h2>
			<p class="mt-3 text-base leading-7 text-muted-foreground">{description}</p>
		</div>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
			{#each stats as stat (stat.label)}
				<div class="stats-cell">
					<p class="stats-value">{stat.value}</p>
					<p class="stats-label">{stat.label}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.stats-cell {
		display: grid;
		gap: 0.6rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
		padding: 1.75rem;
		box-shadow: 0 1px 2px color-mix(in oklch, var(--foreground) 5%, transparent);
	}

	.stats-value {
		font-size: clamp(2.25rem, 5vw, 3.25rem);
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.03em;
	}

	.stats-label {
		color: var(--muted-foreground);
		font-size: 0.95rem;
	}
</style>
