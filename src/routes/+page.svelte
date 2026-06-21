<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import BotIcon from '@lucide/svelte/icons/bot';
	import CheckIcon from '@lucide/svelte/icons/check';
	import Code2Icon from '@lucide/svelte/icons/code-2';
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import UsersIcon from '@lucide/svelte/icons/users';
	import { resolve } from '$app/paths';
	import AppLogo from '$lib/components/app-logo.svelte';
	import FeatureSection from '$lib/components/mist/mfeature/one.svelte';
	import ProductRoutes from '$lib/components/mist/mcontent/one.svelte';
	import OpenSourceSection from '$lib/components/mist/mpricing/one.svelte';
	import PrincipleQuote from '$lib/components/mist/mtestimonial/one.svelte';
	import StackCloud from '$lib/components/mist/mlogocloud/one.svelte';
	import CallToAction from '$lib/components/mist/mcta/one.svelte';
	import SiteFooter from '$lib/components/mist/mfooter/one.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { APP_DESCRIPTION, APP_NAME } from '$lib/constants';

	let mobileNavOpen = $state(false);

	const navLinks = [
		{ label: 'Features', href: '#features' },
		{ label: 'Demo routes', href: '#routes' },
		{ label: 'Open source', href: '#open-source' },
		{ label: 'FAQ', href: '#faq' }
	] as const;

	const to = {
		home: resolve('/'),
		signUp: resolve('/auth/sign-up'),
		signIn: resolve('/auth/sign-in'),
		dashboard: resolve('/dashboard')
	};

	const appNavigation = [
		{ label: 'Overview', icon: LayoutDashboardIcon, active: true },
		{ label: 'Customers', icon: UsersIcon, active: false },
		{ label: 'Assistant', icon: BotIcon, active: false },
		{ label: 'Settings', icon: SettingsIcon, active: false }
	] as const;

	const faq = [
		{
			question: 'Is Product Plate a template or a framework?',
			answer:
				'It is an application starter made from ordinary SvelteKit, Svelte 5, and Convex code. There is no proprietary runtime or generator to keep using.'
		},
		{
			question: 'Can I remove the features I do not need?',
			answer:
				'Yes. Routes and integrations are intentionally separated so billing, AI, the editor, 3D, or graph demos can be removed without changing the core app shell.'
		},
		{
			question: 'What is ready out of the box?',
			answer:
				'Authentication, protected routes, profiles, billing scaffolding, realtime Convex data, file uploads, AI chat patterns, an app shell, forms, charts, tables, and deployment configuration.'
		},
		{
			question: 'Where can I deploy it?',
			answer:
				'The repository is configured for Cloudflare Pages, while the SvelteKit application can be adapted to another supported adapter. Convex hosts the backend functions and data.'
		},
		{
			question: 'Is it accessible and responsive?',
			answer:
				'The starter targets WCAG 2.2 AA, keyboard operation, visible focus, reduced motion, and responsive layouts. Your product-specific changes should preserve those guarantees.'
		}
	] as const;
</script>

<svelte:head>
	<title>{APP_NAME} | Ship the product, not the setup</title>
	<meta name="description" content={APP_DESCRIPTION} />
	<meta property="og:title" content="Product Plate" />
	<meta property="og:description" content={APP_DESCRIPTION} />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary" />
</svelte:head>

<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg"
>
	Skip to content
</a>

<div class="min-h-screen overflow-hidden bg-background text-foreground">
	<header class="border-b">
		<nav
			aria-label="Primary navigation"
			class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
		>
			<a
				href={to.home}
				aria-label="Product Plate home"
				class="flex items-center gap-3 font-semibold tracking-tight"
			>
				<AppLogo class="size-8 rounded-lg" />
				<span>{APP_NAME}</span>
			</a>
			<div class="hidden items-center gap-7 text-sm md:flex">
				{#each navLinks as link (link.label)}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={link.href} class="text-muted-foreground transition-colors hover:text-foreground"
						>{link.label}</a
					>
				{/each}
			</div>
			<div class="flex items-center gap-2">
				<Button href={to.signIn} variant="ghost" size="sm" class="hidden sm:inline-flex"
					>Sign in</Button
				>
				<Button href={to.signUp} size="sm" class="hidden sm:inline-flex">
					Start building
					<ArrowRightIcon data-icon="inline-end" />
				</Button>
				<Sheet.Root bind:open={mobileNavOpen}>
					<Sheet.Trigger>
						{#snippet child({ props })}
							<Button
								{...props}
								variant="ghost"
								size="icon"
								class="md:hidden"
								aria-label="Open menu"
							>
								<MenuIcon />
							</Button>
						{/snippet}
					</Sheet.Trigger>
					<Sheet.Content side="right" class="w-72">
						<Sheet.Header>
							<Sheet.Title>Menu</Sheet.Title>
							<Sheet.Description class="sr-only">Navigate the landing page</Sheet.Description>
						</Sheet.Header>
						<div class="flex flex-col gap-1 px-4">
							<!-- eslint-disable svelte/no-navigation-without-resolve -->
							{#each navLinks as link (link.label)}
								<a
									href={link.href}
									onclick={() => (mobileNavOpen = false)}
									class="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
									>{link.label}</a
								>
							{/each}
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
						</div>
						<Separator class="my-4" />
						<div class="flex flex-col gap-2 px-4">
							<Button
								href={to.signIn}
								variant="outline"
								class="w-full"
								onclick={() => (mobileNavOpen = false)}>Sign in</Button
							>
							<Button href={to.signUp} class="w-full" onclick={() => (mobileNavOpen = false)}>
								Start building
								<ArrowRightIcon data-icon="inline-end" />
							</Button>
						</div>
					</Sheet.Content>
				</Sheet.Root>
			</div>
		</nav>
	</header>

	<main id="main-content">
		<section class="relative py-20 sm:py-28 lg:py-32">
			<div class="landing-grid pointer-events-none absolute inset-0 opacity-45"></div>
			<div
				class="relative mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center"
			>
				<div>
					<Badge variant="outline">
						<SparklesIcon />
						Svelte 5 SaaS foundation
					</Badge>
					<h1
						class="mt-7 max-w-2xl text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl"
					>
						Ship the product, not the setup.
					</h1>
					<p class="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
						A production-minded SvelteKit starter with auth, billing, realtime data, AI, and a
						serious component system. Built for founders who would rather work on the idea.
					</p>
					<div class="mt-9 flex flex-wrap gap-3">
						<Button href={to.signUp} size="lg">
							Start building
							<ArrowRightIcon data-icon="inline-end" />
						</Button>
						<Button href="https://github.com/rodrgds/productplate" variant="outline" size="lg">
							<Code2Icon data-icon="inline-start" />
							View on GitHub
						</Button>
					</div>
					<div class="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
						<span class="flex items-center gap-1.5"><CheckIcon class="size-4" /> MIT licensed</span>
						<span class="flex items-center gap-1.5"><CheckIcon class="size-4" /> Bun-native</span>
						<span class="flex items-center gap-1.5"><CheckIcon class="size-4" /> Type-safe</span>
					</div>
				</div>

				<div class="relative lg:pl-4">
					<div class="absolute -inset-5 rounded-3xl bg-muted/55"></div>
					<div
						class="relative overflow-hidden rounded-2xl border bg-card shadow-xl shadow-foreground/5"
					>
						<div class="flex h-11 items-center border-b px-4">
							<div class="flex gap-1.5">
								<span class="size-2 rounded-full bg-muted-foreground/25"></span>
								<span class="size-2 rounded-full bg-muted-foreground/25"></span>
								<span class="size-2 rounded-full bg-muted-foreground/25"></span>
							</div>
							<span class="mx-auto pr-9 text-xs text-muted-foreground"
								>productplate.pages.dev/dashboard</span
							>
						</div>
						<div class="grid min-h-96 grid-cols-1 sm:min-h-105 sm:grid-cols-[9.5rem_1fr]">
							<aside class="hidden border-r bg-muted/35 p-3 sm:block">
								<div class="flex items-center gap-2 px-2 py-2 text-xs font-semibold">
									<AppLogo class="size-5 rounded-md" />
									Plate Inc.
								</div>
								<Separator class="my-3" />
								<div class="flex flex-col gap-1">
									{#each appNavigation as item (item.label)}
										<div
											class:active-nav={item.active}
											class="flex items-center gap-2 rounded-md px-2 py-2 text-xs text-muted-foreground"
										>
											<item.icon class="size-3.5" />
											{item.label}
										</div>
									{/each}
								</div>
							</aside>
							<div class="min-w-0 p-4 sm:p-5">
								<div class="flex items-center justify-between gap-3">
									<div>
										<p class="text-sm font-semibold">Overview</p>
										<p class="mt-1 text-[0.68rem] text-muted-foreground">Sunday, June 21</p>
									</div>
									<Badge variant="secondary">Live</Badge>
								</div>
								<div class="mt-5 grid gap-3 sm:grid-cols-2">
									<div class="rounded-lg border p-3">
										<p class="text-[0.65rem] text-muted-foreground">Active customers</p>
										<p class="mt-2 text-xl font-semibold">1,429</p>
										<p class="mt-1 text-[0.65rem] text-muted-foreground">+12.5% this month</p>
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
									<div class="mt-6 flex h-28 items-end gap-2">
										{#each [34, 48, 42, 61, 56, 72, 68, 86] as value, index (index)}
											<div
												class="min-w-2 flex-1 rounded-t-sm bg-primary/80"
												style={`height: ${value}%`}
											></div>
										{/each}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<StackCloud />
		<FeatureSection />
		<ProductRoutes />
		<PrincipleQuote />
		<OpenSourceSection />

		<section id="faq" class="py-24 sm:py-32">
			<div class="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.7fr_1.3fr]">
				<div>
					<Badge variant="outline">FAQ</Badge>
					<h2 class="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
						Questions, answered.
					</h2>
					<p class="mt-5 max-w-md text-lg leading-8 text-muted-foreground">
						The short version: Product Plate is ordinary open source code, intentionally organized
						to become your code.
					</p>
				</div>
				<Accordion.Root type="single" class="w-full" value="item-1">
					{#each faq as item, index (item.question)}
						<Accordion.Item value={`item-${index + 1}`}>
							<Accordion.Trigger class="text-left">{item.question}</Accordion.Trigger>
							<Accordion.Content class="max-w-2xl leading-7 text-muted-foreground"
								>{item.answer}</Accordion.Content
							>
						</Accordion.Item>
					{/each}
				</Accordion.Root>
			</div>
		</section>

		<CallToAction />
	</main>

	<SiteFooter />
</div>

<style>
	.landing-grid {
		background-image:
			linear-gradient(
				to right,
				color-mix(in oklch, var(--border) 55%, transparent) 1px,
				transparent 1px
			),
			linear-gradient(
				to bottom,
				color-mix(in oklch, var(--border) 55%, transparent) 1px,
				transparent 1px
			);
		background-size: 42px 42px;
		mask-image: linear-gradient(to bottom, black, transparent 78%);
	}

	.active-nav {
		background: var(--muted);
		color: var(--foreground);
	}
</style>
