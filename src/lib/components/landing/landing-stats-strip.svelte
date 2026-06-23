<script lang="ts">
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import { Badge } from '$lib/components/ui/badge';

	interface StatItem {
		value: string;
		label: string;
		detail: string;
	}

	interface Props {
		eyebrow?: string;
		title?: string;
		stats?: readonly StatItem[];
	}

	let {
		eyebrow = 'Launch proof',
		title = 'A compact numbers band for founders, tools, and public launches.',
		stats = [
			{ value: '8.4k', label: 'waitlist signups', detail: '+34% after proof section' },
			{ value: '21', label: 'days saved', detail: 'setup work skipped' },
			{ value: '4.9/5', label: 'pilot rating', detail: 'from 62 beta users' },
			{ value: '99.9%', label: 'route uptime', detail: 'tracked from day one' }
		]
	}: Props = $props();
</script>

<section class="py-16 sm:py-20">
	<div class="mx-auto max-w-7xl px-6">
		<div
			class="grid gap-8 rounded-2xl border bg-card p-6 shadow-sm sm:p-8 lg:grid-cols-[0.9fr_1.4fr] lg:items-center"
		>
			<div>
				<Badge variant="outline">{eyebrow}</Badge>
				<h2
					class="mt-4 max-w-2xl text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl"
				>
					{title}
				</h2>
			</div>
			<div class="grid gap-3 sm:grid-cols-2">
				{#each stats as stat (stat.label)}
					<div class="rounded-xl border bg-background p-4">
						<div class="flex items-start justify-between gap-4">
							<p class="text-3xl font-semibold tracking-tight">{stat.value}</p>
							<Badge variant="secondary">
								<ArrowUpRightIcon />
								Active
							</Badge>
						</div>
						<p class="mt-3 text-sm font-medium">{stat.label}</p>
						<p class="mt-1 text-sm text-muted-foreground">{stat.detail}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
