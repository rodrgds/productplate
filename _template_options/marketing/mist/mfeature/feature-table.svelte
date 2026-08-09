<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Table from '$lib/components/ui/table';

	const customers = [
		{ initials: 'AR', name: 'Avery Reed', plan: 'Pro', status: 'Active', value: '$1,240' },
		{ initials: 'MK', name: 'Mina Kim', plan: 'Starter', status: 'Trial', value: '$480' },
		{ initials: 'JL', name: 'Jon Lane', plan: 'Pro', status: 'Active', value: '$920' },
		{ initials: 'SK', name: 'Sam Kaur', plan: 'Team', status: 'Active', value: '$2,100' },
		{ initials: 'CN', name: 'Chris Noel', plan: 'Starter', status: 'Trial', value: '$360' },
		{ initials: 'IP', name: 'Iris Park', plan: 'Pro', status: 'Active', value: '$1,680' }
	] as const;
</script>

<div class="overflow-hidden rounded-xl border bg-background shadow-sm">
	<div class="flex items-center justify-between border-b px-6 py-5">
		<div>
			<p class="font-medium">Recent customers</p>
			<p class="text-sm text-muted-foreground">Live product data, ready for your schema.</p>
		</div>
		<Badge variant="secondary">Convex query</Badge>
	</div>
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head>Customer</Table.Head>
				<Table.Head>Plan</Table.Head>
				<Table.Head>Status</Table.Head>
				<Table.Head class="text-right">Value</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each customers as customer (customer.name)}
				<Table.Row>
					<Table.Cell>
						<div class="flex items-center gap-3">
							<Avatar.Root class="size-8">
								<Avatar.Fallback>{customer.initials}</Avatar.Fallback>
							</Avatar.Root>
							<span class="font-medium">{customer.name}</span>
						</div>
					</Table.Cell>
					<Table.Cell>{customer.plan}</Table.Cell>
					<Table.Cell><Badge variant="outline">{customer.status}</Badge></Table.Cell>
					<Table.Cell class="text-right font-medium">{customer.value}</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
