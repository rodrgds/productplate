<script lang="ts">
	import { siProducthunt, siReddit, siX } from 'simple-icons';

	interface BrandIcon {
		title: string;
		path: string;
	}

	interface Props {
		source: string;
		class?: string;
	}

	let { source, class: className = 'size-4' }: Props = $props();

	const registry = {
		X: { title: 'X', path: siX.path },
		Twitter: { title: 'X', path: siX.path },
		Reddit: { title: 'Reddit', path: siReddit.path },
		PH: { title: 'Product Hunt', path: siProducthunt.path },
		ProductHunt: { title: 'Product Hunt', path: siProducthunt.path },
		LinkedIn: {
			title: 'LinkedIn',
			path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
		}
	} satisfies Record<string, BrandIcon>;

	const icon = $derived(
		// SAFETY: source comes from sample data; unknown brands fall through to the text label.
		registry[source as keyof typeof registry]
	);
</script>

{#if icon}
	<svg role="img" aria-label={icon.title} viewBox="0 0 24 24" class={className} fill="currentColor">
		<path d={icon.path} />
	</svg>
{:else}
	<span class="text-[0.7rem] font-semibold tracking-wide uppercase">{source}</span>
{/if}
