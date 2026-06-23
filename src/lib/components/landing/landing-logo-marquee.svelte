<script lang="ts">
	interface Props {
		label?: string;
		logos?: readonly string[];
	}

	let {
		label = 'Teams can restyle these sections around their own stack',
		logos = [
			'SvelteKit',
			'Convex',
			'Better Auth',
			'Autumn',
			'AI SDK',
			'Tailwind CSS',
			'shadcn-svelte',
			'Cloudflare'
		]
	}: Props = $props();
</script>

<section aria-label={label} class="border-y bg-muted/30">
	<div class="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[18rem_1fr] lg:items-center">
		<p class="text-sm font-medium text-muted-foreground">{label}</p>
		<div class="marquee" aria-hidden="true">
			<ul class="marquee-track">
				{#each [...logos, ...logos] as logo, index (`${logo}-${index}`)}
					<li>{logo}</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.marquee {
		overflow: hidden;
		mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
	}

	.marquee-track {
		display: flex;
		width: max-content;
		align-items: center;
		gap: 2rem;
		animation: marquee-scroll 28s linear infinite;
	}

	.marquee-track li {
		white-space: nowrap;
		font-size: 0.95rem;
		font-weight: 650;
		letter-spacing: 0;
		color: var(--foreground);
	}

	@keyframes marquee-scroll {
		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.marquee-track {
			animation: none;
			flex-wrap: wrap;
			width: auto;
		}
	}
</style>
