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
			name: 'Auth',
			detail: 'Accounts, sessions, recovery, OAuth, and protected app routes.'
		},
		{
			icon: CreditCardIcon,
			name: 'Billing',
			detail: 'Plans, checkout, and customer state through Autumn.'
		},
		{
			icon: WorkflowIcon,
			name: 'Realtime backend',
			detail: 'Convex functions, storage, typed APIs, and live queries.'
		},
		{
			icon: BotIcon,
			name: 'AI patterns',
			detail: 'Streaming chat, Markdown, suggestions, and tool calls.'
		}
	] as const;
</script>

<section id="features" class="border-y bg-muted/35 py-20 sm:py-28">
	<div class="mx-auto max-w-7xl px-6">
		<div class="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
			<div>
				<Badge variant="outline">What you do not rebuild</Badge>
				<h2 class="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
					The boring SaaS base is already wired.
				</h2>
			</div>
			<p class="max-w-2xl text-lg leading-8 text-muted-foreground lg:justify-self-end">
				Start from working routes and real integrations. Keep what fits, remove what does not, and
				spend the first week on the actual product.
			</p>
		</div>

		<div class="mt-12 grid gap-5 lg:grid-cols-[1.55fr_0.75fr]">
			<div class="min-w-0"><FeatureTable /></div>
			<Card.Root class="min-h-full justify-between">
				<Card.Header>
					<Card.Title>Default foundations</Card.Title>
					<Card.Description>Useful enough to keep. Plain enough to replace.</Card.Description>
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
