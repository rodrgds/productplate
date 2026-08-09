<script lang="ts">
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import BotIcon from '@lucide/svelte/icons/bot';
	import ChartNoAxesCombinedIcon from '@lucide/svelte/icons/chart-no-axes-combined';
	import CheckIcon from '@lucide/svelte/icons/check';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import SendIcon from '@lucide/svelte/icons/send';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import UserIcon from '@lucide/svelte/icons/user';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Badge } from '$lib/components/ui/badge';

	const routes = [
		{
			value: 'dashboard',
			label: 'Dashboard',
			icon: ChartNoAxesCombinedIcon,
			path: '/dashboard',
			detail: 'Summary cards, charts, tables, and a responsive app shell.'
		},
		{
			value: 'assistant',
			label: 'AI assistant',
			icon: BotIcon,
			path: '/assistant',
			detail: 'Streaming messages, Markdown, suggestions, and tool-call patterns.'
		},
		{
			value: 'billing',
			label: 'Billing',
			icon: CreditCardIcon,
			path: '/billing',
			detail: 'Subscription state and checkout scaffolding through Autumn.'
		},
		{
			value: 'settings',
			label: 'Settings',
			icon: SettingsIcon,
			path: '/settings',
			detail: 'Account, email, password, and profile flows with validated forms.'
		}
	] as const;

	const bars = [34, 48, 42, 61, 56, 72, 68, 86];
</script>

<section id="routes" class="py-20 sm:py-28">
	<div class="mx-auto max-w-6xl px-6">
		<div class="max-w-3xl">
			<Badge variant="outline">Clickable starter</Badge>
			<h2 class="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
				Not screenshots. Real routes.
			</h2>
			<p class="mt-5 text-lg leading-8 text-muted-foreground">
				Open the demo, click around, then decide what your product should keep. The kickstart prompt
				is written to turn these defaults into a specific app.
			</p>
		</div>

		<Tabs.Root
			value="dashboard"
			class="mt-12 grid gap-6 lg:grid-cols-[0.42fr_1.58fr] lg:items-start"
		>
			<div class="flex flex-col gap-3">
				<Tabs.List
					class="grid h-auto w-full grid-cols-2 content-start gap-2 bg-transparent p-0 lg:grid-cols-1"
				>
					{#each routes as route (route.value)}
						<Tabs.Trigger
							value={route.value}
							class="h-auto w-full justify-start gap-3 border px-4 py-3 data-[state=active]:bg-muted"
						>
							<route.icon class="size-4" />
							<span>{route.label}</span>
						</Tabs.Trigger>
					{/each}
				</Tabs.List>

				<div class="hidden rounded-xl border bg-card/60 p-4 shadow-sm lg:block">
					<p class="text-xs font-semibold">Route coverage</p>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">
						Real pages with shared shell, auth boundaries, and product-ready UI patterns.
					</p>
					<div class="mt-4 grid gap-2 text-xs text-muted-foreground">
						<div class="flex items-center gap-2">
							<CheckIcon class="size-3.5" />
							<span>4 core product routes</span>
						</div>
						<div class="flex items-center gap-2">
							<CheckIcon class="size-3.5" />
							<span>Shared app shell</span>
						</div>
						<div class="flex items-center gap-2">
							<CheckIcon class="size-3.5" />
							<span>Easy to keep or remove</span>
						</div>
					</div>
				</div>
			</div>

			{#each routes as route (route.value)}
				<Tabs.Content value={route.value} class="mt-0">
					<div class="overflow-hidden rounded-xl border bg-card shadow-sm">
						<div class="flex items-center gap-2 border-b px-4 py-3">
							<span class="size-2 rounded-full bg-muted-foreground/30"></span>
							<span class="size-2 rounded-full bg-muted-foreground/30"></span>
							<span class="size-2 rounded-full bg-muted-foreground/30"></span>
							<code class="ml-3 truncate text-xs text-muted-foreground"
								>productplate.pages.dev{route.path}</code
							>
						</div>

						<div class="min-h-80 p-4 sm:min-h-96 sm:p-5">
							{#if route.value === 'dashboard'}
								<div class="flex items-center justify-between gap-3">
									<div>
										<p class="text-sm font-semibold">Overview</p>
										<p class="mt-1 text-[0.68rem] text-muted-foreground">Sunday, June 21</p>
									</div>
									<Badge variant="secondary">Live</Badge>
								</div>
								<div class="mt-4 grid gap-3 sm:grid-cols-2">
									<div class="rounded-lg border p-3">
										<p class="text-[0.65rem] text-muted-foreground">Active customers</p>
										<p class="mt-2 text-xl font-semibold">1,429</p>
										<p class="mt-1 flex items-center gap-1 text-[0.65rem] text-muted-foreground">
											<ArrowUpRightIcon class="size-3" />+12.5% this month
										</p>
									</div>
									<div class="rounded-lg border p-3">
										<p class="text-[0.65rem] text-muted-foreground">Monthly revenue</p>
										<p class="mt-2 text-xl font-semibold">$24.8k</p>
										<p class="mt-1 text-[0.65rem] text-muted-foreground">83% of target</p>
									</div>
								</div>
								<div class="mt-3 rounded-lg border p-4">
									<div class="flex items-center justify-between">
										<p class="text-xs font-medium">Growth</p>
										<span class="text-[0.65rem] text-muted-foreground">Last 8 weeks</span>
									</div>
									<div class="mt-5 flex h-24 items-end gap-2">
										{#each bars as value, index (index)}
											<div
												class="min-w-2 flex-1 rounded-t-sm bg-primary/80"
												style={`height: ${value}%`}
											></div>
										{/each}
									</div>
								</div>
							{:else if route.value === 'assistant'}
								<div class="flex items-center gap-2 border-b pb-3">
									<div
										class="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground"
									>
										<BotIcon class="size-3.5" />
									</div>
									<div>
										<p class="text-xs font-semibold">AI workbench</p>
										<p class="text-[0.65rem] text-muted-foreground">OpenRouter free router</p>
									</div>
								</div>
								<div class="flex flex-col gap-3 py-3">
									<div class="flex justify-end">
										<div
											class="max-w-[78%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-xs text-primary-foreground"
										>
											Summarize this week's feedback
										</div>
									</div>
									<div class="flex justify-start gap-2">
										<div
											class="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
										>
											<BotIcon class="size-3" />
										</div>
										<div
											class="max-w-[78%] rounded-2xl rounded-tl-sm border bg-background px-3 py-2 text-xs"
										>
											<p class="text-muted-foreground">Using app context:</p>
											<p class="mt-1">Most requests mention billing exports and team roles.</p>
										</div>
									</div>
								</div>
								<div class="mt-3 flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
									<span class="text-xs text-muted-foreground">Ask the agent...</span>
									<div
										class="ml-auto flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground"
									>
										<SendIcon class="size-3" />
									</div>
								</div>
							{:else if route.value === 'billing'}
								<div class="mx-auto max-w-sm">
									<div class="rounded-xl border p-4">
										<div class="flex items-center justify-between">
											<div>
												<p class="text-sm font-semibold">Pro plan</p>
												<p class="text-[0.65rem] text-muted-foreground">Renews Aug 12</p>
											</div>
											<Badge variant="secondary">Active</Badge>
										</div>
										<p class="mt-4 text-2xl font-semibold">
											$24<span class="text-sm font-normal text-muted-foreground">/mo</span>
										</p>
										<ul class="mt-4 grid gap-2">
											{#each ['Unlimited projects', 'Priority support', '10k API calls/mo'] as item (item)}
												<li class="flex items-center gap-2 text-xs">
													<CheckIcon class="size-3.5 text-muted-foreground" />
													<span>{item}</span>
												</li>
											{/each}
										</ul>
										<div class="mt-4">
											<div
												class="flex items-center justify-between text-[0.65rem] text-muted-foreground"
											>
												<span>Seats</span><span>3 / 5</span>
											</div>
											<div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
												<div class="h-full w-3/5 rounded-full bg-primary"></div>
											</div>
										</div>
									</div>
								</div>
							{:else if route.value === 'settings'}
								<div class="mx-auto flex max-w-sm flex-col gap-4">
									<div class="flex items-center gap-3">
										<div
											class="flex size-10 items-center justify-center rounded-full border bg-muted"
										>
											<UserIcon class="size-4" />
										</div>
										<div class="min-w-0 flex-1">
											<p class="truncate text-xs font-semibold">Avery Reed</p>
											<p class="truncate text-[0.65rem] text-muted-foreground">
												avery@productplate.pages.dev
											</p>
										</div>
									</div>
									<div class="flex flex-col gap-3">
										<div>
											<p class="text-[0.65rem] text-muted-foreground">Display name</p>
											<div class="mt-1 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
												Avery Reed
											</div>
										</div>
										<div>
											<p class="text-[0.65rem] text-muted-foreground">Email</p>
											<div class="mt-1 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
												avery@productplate.pages.dev
											</div>
										</div>
										<div class="flex items-center justify-between rounded-lg border px-3 py-2.5">
											<span class="text-xs">Email notifications</span>
											<span class="flex h-4 w-7 items-center rounded-full bg-primary px-0.5">
												<span class="ml-auto size-3 rounded-full bg-primary-foreground"></span>
											</span>
										</div>
									</div>
								</div>
							{/if}
						</div>

						<div class="border-t px-4 py-3">
							<p class="text-xs leading-5 text-muted-foreground">{route.detail}</p>
						</div>
					</div>
				</Tabs.Content>
			{/each}
		</Tabs.Root>
	</div>
</section>
