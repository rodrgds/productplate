<script lang="ts">
	import BotIcon from '@lucide/svelte/icons/bot';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import WorkflowIcon from '@lucide/svelte/icons/workflow';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import FeatureTable from './feature-table.svelte';

	const foundations = [
		{
			icon: ShieldCheckIcon,
			name: 'Better Auth',
			detail: 'Sessions, recovery, OAuth, protected routes'
		},
		{ icon: CreditCardIcon, name: 'Autumn billing', detail: 'Plans, checkout, and customer state' },
		{ icon: BotIcon, name: 'AI SDK', detail: 'Streaming assistant and tool patterns' },
		{ icon: WorkflowIcon, name: 'Convex', detail: 'Realtime data, functions, and file storage' }
	] as const;
</script>

<section id="features" class="border-y bg-muted/35 py-24 sm:py-32">
	<div class="mx-auto max-w-6xl px-6">
		<div class="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
			<div>
				<Badge variant="outline">A complete starting surface</Badge>
				<h2 class="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
					Everything around your idea is already here.
				</h2>
			</div>
			<p class="max-w-2xl text-lg leading-8 text-muted-foreground lg:justify-self-end">
				Start with working product routes instead of a screenshot-only template. Replace the sample
				data, keep the infrastructure, and spend the first week on your differentiator.
			</p>
		</div>

		<div class="mt-14 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
			<div class="min-w-0"><FeatureTable /></div>
			<Card.Root class="justify-between">
				<Card.Header>
					<Card.Title>Production foundations</Card.Title>
					<Card.Description
						>Integrated, typed, and represented by working demo routes.</Card.Description
					>
				</Card.Header>
				<Card.Content class="flex flex-col gap-5">
					{#each foundations as item (item.name)}
						<div class="flex gap-3">
							<div
								class="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted"
							>
								<item.icon class="size-4" />
							</div>
							<div>
								<p class="text-sm font-medium">{item.name}</p>
								<p class="mt-1 text-sm leading-5 text-muted-foreground">{item.detail}</p>
							</div>
						</div>
					{/each}
				</Card.Content>
				<Card.Footer><Badge variant="secondary">Bun + TypeScript</Badge></Card.Footer>
			</Card.Root>
		</div>
	</div>
</section>
