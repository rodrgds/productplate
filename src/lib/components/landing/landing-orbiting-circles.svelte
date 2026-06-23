<script lang="ts">
	import BlocksIcon from '@lucide/svelte/icons/blocks';

	export interface OrbitingItem {
		name: string;
		status: string;
	}

	interface PositionedOrbitingItem extends OrbitingItem {
		x: number;
		y: number;
	}

	interface Props {
		items: readonly OrbitingItem[];
		coreLabel?: string;
		radius?: number;
	}

	let { items, coreLabel = 'Product', radius = 155 }: Props = $props();

	const positionedItems: PositionedOrbitingItem[] = $derived(
		items.map((item, index) => {
			const angle = (index / items.length) * Math.PI * 2 - Math.PI / 2;

			return {
				...item,
				x: Math.cos(angle) * radius,
				y: Math.sin(angle) * radius
			};
		})
	);
</script>

<div class="orbit-root" style={`--orbit-radius: ${radius}px`}>
	<svg class="orbit-paths" viewBox="0 0 400 400" aria-hidden="true">
		<circle cx="200" cy="200" r={radius} fill="none"></circle>
		<circle cx="200" cy="200" r={Math.max(72, radius * 0.56)} fill="none"></circle>
	</svg>

	<div class="orbit-core">
		<BlocksIcon class="size-7" />
		<span>{coreLabel}</span>
	</div>

	{#each positionedItems as item (item.name)}
		<div class="orbit-chip" style={`--orbit-x: ${item.x}px; --orbit-y: ${item.y}px`}>
			<span>{item.name}</span>
			<small>{item.status}</small>
		</div>
	{/each}
</div>

<style>
	.orbit-root {
		position: relative;
		min-height: 28rem;
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background:
			radial-gradient(
				circle at center,
				color-mix(in oklch, var(--muted) 78%, transparent),
				transparent 66%
			),
			var(--background);
	}

	.orbit-paths {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.orbit-paths circle {
		stroke: color-mix(in oklch, var(--foreground) 10%, transparent);
		stroke-width: 1;
	}

	.orbit-core,
	.orbit-chip {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	.orbit-core {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 8rem;
		height: 8rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--card);
		font-size: 0.9rem;
		font-weight: 650;
		box-shadow: 0 18px 36px color-mix(in oklch, var(--foreground) 6%, transparent);
	}

	.orbit-chip {
		display: grid;
		width: 8.7rem;
		gap: 0.2rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--card);
		padding: 0.55rem 0.8rem;
		text-align: center;
		box-shadow: 0 12px 26px color-mix(in oklch, var(--foreground) 5%, transparent);
		transform: translate(-50%, -50%) translate(var(--orbit-x), var(--orbit-y));
	}

	.orbit-chip span {
		font-size: 0.82rem;
		font-weight: 650;
	}

	.orbit-chip small {
		color: var(--muted-foreground);
		font-size: 0.7rem;
	}

	@media (max-width: 640px) {
		.orbit-root {
			display: grid;
			min-height: auto;
			gap: 0.75rem;
			padding: 1rem;
		}

		.orbit-paths {
			display: none;
		}

		.orbit-core,
		.orbit-chip {
			position: static;
			width: auto;
			height: auto;
			transform: none;
		}

		.orbit-core {
			border-radius: 1rem;
			padding: 1rem;
		}
	}
</style>
