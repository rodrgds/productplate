<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import PlugZapIcon from '@lucide/svelte/icons/plug-zap';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import LandingOrbitingCircles from './landing-orbiting-circles.svelte';

	interface Integration {
		name: string;
		status: string;
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		integrations?: readonly Integration[];
	}

	let {
		kicker = 'Integration cloud',
		title = 'Show the stack as a system, not a logo pile.',
		description = 'A centered orbit pattern adapted from Magic UI’s orbiting circles, restyled for Product Plate and kept stable so the labels do not drift.',
		integrations = [
			{ name: 'SvelteKit', status: 'App routes' },
			{ name: 'Convex', status: 'Realtime data' },
			{ name: 'Better Auth', status: 'Sessions' },
			{ name: 'Autumn', status: 'Billing' },
			{ name: 'AI SDK', status: 'Assistant' },
			{ name: 'Cloudflare', status: 'Deploy' },
			{ name: 'Uppy', status: 'Uploads' },
			{ name: 'Svelte Flow', status: 'Graphs' }
		]
	}: Props = $props();
</script>

<section class="border-y bg-muted/30 py-20 sm:py-24">
	<div class="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
		<div>
			<Badge variant="outline">{kicker}</Badge>
			<h2 class="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
				{title}
			</h2>
			<p class="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{description}</p>
			<div class="mt-8 grid gap-3 sm:grid-cols-2">
				<div class="flex items-center gap-2 text-sm">
					<CheckIcon class="size-4" />
					<span>Use with your own service logos</span>
				</div>
				<div class="flex items-center gap-2 text-sm">
					<CheckIcon class="size-4" />
					<span>Centered ring geometry</span>
				</div>
			</div>
		</div>

		<Card.Root class="overflow-hidden">
			<Card.Header>
				<Card.Action>
					<div class="flex size-10 items-center justify-center rounded-xl border bg-muted">
						<PlugZapIcon class="size-5" />
					</div>
				</Card.Action>
				<Card.Title>Production stack</Card.Title>
				<Card.Description>Replace labels with connected services or brand marks.</Card.Description>
			</Card.Header>
			<Card.Content>
				<LandingOrbitingCircles items={integrations} />
			</Card.Content>
		</Card.Root>
	</div>
</section>
