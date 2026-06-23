<script lang="ts">
	import { LayoutGroup, MotionConfig, motion } from '@humanspeak/svelte-motion';
	import BotIcon from '@lucide/svelte/icons/bot';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import DatabaseZapIcon from '@lucide/svelte/icons/database-zap';
	import LockKeyholeIcon from '@lucide/svelte/icons/lock-keyhole';
	import type { Component } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { Badge } from '$lib/components/ui/badge';

	interface TabItem {
		value: string;
		label: string;
		title: string;
		description: string;
		icon: Component;
		rows: readonly string[];
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		tabs?: readonly TabItem[];
	}

	let {
		kicker = 'Feature tabs',
		title = 'A classic product section, tightened for repeat scanning.',
		description = 'A Svelte transfer of beUI’s shared-layout tab idea: the indicator moves because it helps orientation, while the content stays steady.',
		tabs = [
			{
				value: 'auth',
				label: 'Auth',
				title: 'Account flows without a blank auth page',
				description:
					'Show sign-up, recovery, sessions, protected layouts, and profile state as one complete product story.',
				icon: LockKeyholeIcon,
				rows: ['Email and OAuth ready', 'Session-aware navigation', 'Profile completion flow']
			},
			{
				value: 'data',
				label: 'Data',
				title: 'Realtime data gets a landing section too',
				description:
					'Pair Convex queries with concrete UI states, so visitors can see how the app changes once data arrives.',
				icon: DatabaseZapIcon,
				rows: ['Typed query boundaries', 'Live tables and charts', 'Storage-ready upload surfaces']
			},
			{
				value: 'billing',
				label: 'Billing',
				title: 'Pricing copy can match the actual billing model',
				description:
					'Connect plans, checkout state, portal actions, and customer limits in one consistent narrative.',
				icon: CreditCardIcon,
				rows: ['Plan cards', 'Usage limits', 'Upgrade and portal calls']
			},
			{
				value: 'ai',
				label: 'AI',
				title: 'AI features deserve product-grade framing',
				description:
					'Use assistant previews, tool rows, and reasoning states without making the page feel like a generic AI site.',
				icon: BotIcon,
				rows: ['Streaming response layout', 'Tool result cards', 'Model selector ready']
			}
		]
	}: Props = $props();

	let selectedValue = $state<string | null>(null);
	const activeValue = $derived(selectedValue ?? tabs[0]?.value ?? '');
	const activeTab = $derived(tabs.find((tab) => tab.value === activeValue) ?? tabs[0]);
	const reduceMotion = $derived(prefersReducedMotion.current);
	const tabTransition = $derived(
		reduceMotion
			? { duration: 0 }
			: { type: 'spring' as const, stiffness: 170, damping: 24, mass: 1.2 }
	);
</script>

<section class="py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
			<div>
				<Badge variant="outline">{kicker}</Badge>
				<h2 class="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
					{title}
				</h2>
			</div>
			<p class="max-w-2xl text-lg leading-8 text-muted-foreground lg:justify-self-end">
				{description}
			</p>
		</div>

		{#if activeTab}
			<MotionConfig transition={tabTransition}>
				<LayoutGroup id="landing-feature-tabs">
					<div class="mt-12 grid gap-6 lg:grid-cols-[18rem_1fr]">
						<div
							role="tablist"
							aria-label="Landing component feature examples"
							class="inline-flex h-fit flex-wrap items-center gap-1 rounded-xl border bg-card p-1 lg:grid lg:w-full"
						>
							{#each tabs as tab (tab.value)}
								<div class="relative">
									{#if activeValue === tab.value}
										<motion.span
											layoutId="landing-feature-active-tab"
											class="absolute inset-0 rounded-lg bg-primary"
										></motion.span>
									{/if}
									<button
										type="button"
										role="tab"
										aria-selected={activeValue === tab.value}
										aria-controls={`landing-tabpanel-${tab.value}`}
										id={`landing-tab-${tab.value}`}
										class={[
											'relative z-10 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-transparent px-4 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
											activeValue === tab.value
												? 'text-primary-foreground'
												: 'text-muted-foreground hover:text-foreground'
										].join(' ')}
										onclick={() => (selectedValue = tab.value)}
									>
										<tab.icon class="size-4" />
										<span>{tab.label}</span>
									</button>
								</div>
							{/each}
						</div>

						<div
							id={`landing-tabpanel-${activeTab.value}`}
							role="tabpanel"
							aria-labelledby={`landing-tab-${activeTab.value}`}
							class="feature-panel"
						>
							<div class="grid gap-6 p-5 sm:p-6 lg:grid-cols-[0.95fr_1.05fr]">
								<div class="flex flex-col justify-between gap-8">
									<div>
										<div
											class="flex size-11 items-center justify-center rounded-xl border bg-muted"
										>
											<activeTab.icon class="size-5" />
										</div>
										<h3 class="mt-5 text-2xl font-semibold tracking-tight">{activeTab.title}</h3>
										<p class="mt-3 max-w-xl leading-7 text-muted-foreground">
											{activeTab.description}
										</p>
									</div>
									<div class="grid gap-2">
										{#each activeTab.rows as row (row)}
											<div class="rounded-lg border bg-background px-3 py-2 text-sm">{row}</div>
										{/each}
									</div>
								</div>

								<div class="rounded-xl border bg-background p-4">
									<div class="flex items-center justify-between border-b pb-3">
										<p class="text-sm font-semibold">Product preview</p>
										<Badge variant="secondary">Example</Badge>
									</div>
									<div class="mt-4 grid gap-3">
										{#each activeTab.rows as row, index (row)}
											<div
												class="grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 rounded-lg border bg-card p-3"
											>
												<div
													class="flex size-9 items-center justify-center rounded-lg bg-muted text-sm font-semibold"
												>
													{index + 1}
												</div>
												<div>
													<p class="text-sm font-medium">{row}</p>
													<p class="mt-1 text-xs text-muted-foreground">
														Bound to real route state
													</p>
												</div>
												<span class="h-2 w-12 rounded-full bg-primary"></span>
											</div>
										{/each}
									</div>
								</div>
							</div>
						</div>
					</div>
				</LayoutGroup>
			</MotionConfig>
		{/if}
	</div>
</section>

<style>
	.feature-panel {
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
		box-shadow: 0 1px 2px color-mix(in oklch, var(--foreground) 5%, transparent);
	}
</style>
