<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';

	interface Row {
		label: string;
		starter: boolean;
		template: boolean;
		custom: boolean;
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		rows?: readonly Row[];
	}

	let {
		kicker = 'Comparison',
		title = 'Make the tradeoffs obvious before the pricing table.',
		description = 'A compact comparison block helps visitors understand why a starter is different from a static template or a long custom build.',
		rows = [
			{ label: 'Real authenticated routes', starter: true, template: false, custom: true },
			{ label: 'Backend functions included', starter: true, template: false, custom: true },
			{ label: 'Components live in repo', starter: true, template: true, custom: true },
			{ label: 'Billing integration path', starter: true, template: false, custom: true },
			{ label: 'Immediate design system', starter: true, template: true, custom: false },
			{ label: 'Weeks of blank setup', starter: false, template: false, custom: true }
		]
	}: Props = $props();

	const columns = [
		{ key: 'starter', label: 'Product Plate' },
		{ key: 'template', label: 'Static template' },
		{ key: 'custom', label: 'Custom build' }
	] as const;
</script>

<section class="py-20 sm:py-24">
	<div class="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
		<div>
			<Badge variant="outline">{kicker}</Badge>
			<h2 class="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
				{title}
			</h2>
			<p class="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">{description}</p>
		</div>

		<Card.Root class="overflow-hidden">
			<Card.Header>
				<Card.Title>Starter fit</Card.Title>
				<Card.Description>Dummy data, ready to connect to your own positioning.</Card.Description>
			</Card.Header>
			<Card.Content class="p-0">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Capability</Table.Head>
							{#each columns as column (column.key)}
								<Table.Head class="text-center">{column.label}</Table.Head>
							{/each}
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each rows as row (row.label)}
							<Table.Row>
								<Table.Cell class="font-medium">{row.label}</Table.Cell>
								{#each columns as column (column.key)}
									<Table.Cell class="text-center">
										{#if row[column.key]}
											<span
												class="inline-flex size-7 items-center justify-center rounded-full bg-muted"
											>
												<CheckIcon class="size-4" />
											</span>
										{:else}
											<span
												class="inline-flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
											>
												<MinusIcon class="size-4" />
											</span>
										{/if}
									</Table.Cell>
								{/each}
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	</div>
</section>
