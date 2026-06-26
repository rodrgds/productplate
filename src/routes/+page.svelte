<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import Code2Icon from '@lucide/svelte/icons/code-2';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
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
	import {
		APP_DESCRIPTION,
		APP_NAME,
		APP_OG_IMAGE_URL,
		APP_SOCIAL_DESCRIPTION,
		APP_SOCIAL_TITLE,
		APP_TWITTER_CARD,
		APP_URL
	} from '$lib/constants';

	let mobileNavOpen = $state(false);

	const to = {
		home: resolve('/'),
		signUp: resolve('/auth/sign-up'),
		signIn: resolve('/auth/sign-in'),
		dashboard: resolve('/dashboard'),
		demo: resolve('/auth/demo'),
		components: resolve('/components')
	};

	const navLinks = [
		{ label: 'Kickstart', href: '#kickstart' },
		{ label: 'Stack', href: '#stack' },
		{ label: 'Routes', href: '#routes' },
		{ label: 'Components', href: resolve('/components') },
		{ label: 'FAQ', href: '#faq' }
	] as const;

	const kickstartSteps = [
		{
			title: 'Describe the product',
			detail: 'Name it, define the user, and set the first-launch goal.'
		},
		{
			title: 'Choose what survives',
			detail: 'Keep auth, billing, AI, routes, or components only when the product needs them.'
		},
		{
			title: 'Let the agent reshape the repo',
			detail: 'Rename copy, remove demo-only surfaces, update docs, and leave a smaller app.'
		}
	] as const;

	const faq = [
		{
			question: 'Is Product Plate just another template?',
			answer:
				'No. The repo is the base, but the Kickstart prompt is part of the product. It tells an AI coding agent how to turn the starter into a specific app instead of leaving you with generic boilerplate.'
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
			question: 'Is it a framework?',
			answer:
				'No. It is ordinary SvelteKit, Svelte 5, and Convex application code. Fork it, delete parts, and make it yours.'
		}
	] as const;
</script>

<svelte:head>
	<title>{APP_NAME} | Ship the product, not the setup</title>
	<meta name="description" content={APP_DESCRIPTION} />
	<link rel="canonical" href={APP_URL} />
	<meta property="og:site_name" content={APP_NAME} />
	<meta property="og:title" content={APP_SOCIAL_TITLE} />
	<meta property="og:description" content={APP_SOCIAL_DESCRIPTION} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={APP_URL} />
	<meta property="og:image" content={APP_OG_IMAGE_URL} />
	<meta property="og:image:secure_url" content={APP_OG_IMAGE_URL} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Product Plate — ship the product, not the setup" />
	<meta name="twitter:card" content={APP_TWITTER_CARD} />
	<meta name="twitter:title" content={APP_SOCIAL_TITLE} />
	<meta name="twitter:description" content={APP_SOCIAL_DESCRIPTION} />
	<meta name="twitter:image" content={APP_OG_IMAGE_URL} />
	<meta name="twitter:image:alt" content="Product Plate — ship the product, not the setup" />
</svelte:head>

<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:shadow-lg"
>
	Skip to content
</a>

<div class="min-h-screen overflow-hidden bg-background text-foreground">
	<header class="border-b bg-background/85 backdrop-blur">
		<nav
			aria-label="Primary navigation"
			class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
		>
			<a
				href={resolve('/')}
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
				<Button href={to.demo} size="sm" class="hidden sm:inline-flex">
					Use demo
					<ArrowRightIcon data-icon="inline-end" />
				</Button>
				<Button
					href="https://github.com/rodrgds/productplate"
					variant="outline"
					size="sm"
					class="hidden sm:inline-flex"
				>
					GitHub
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
							<Button href={to.demo} class="w-full" onclick={() => (mobileNavOpen = false)}>
								Use demo
								<ArrowRightIcon data-icon="inline-end" />
							</Button>
							<Button
								href="https://github.com/rodrgds/productplate"
								variant="outline"
								class="w-full"
								onclick={() => (mobileNavOpen = false)}>GitHub</Button
							>
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
				class="relative mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center"
			>
				<div>
					<Badge variant="outline">
						<SparklesIcon />
						Template + AI kickstart
					</Badge>
					<h1
						class="mt-7 max-w-3xl text-5xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl"
					>
						Start with a real SvelteKit product. Then make it yours.
					</h1>
					<p class="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
						Product Plate gives you the SaaS base: auth, billing, Convex, AI, tests, deployment, and
						app UI. The Kickstart prompt tells your coding agent what to keep, rename, and remove.
					</p>
					<div class="mt-9 flex flex-wrap gap-3">
						<Button href={to.demo} size="lg">
							Try the demo
							<ArrowRightIcon data-icon="inline-end" />
						</Button>
						<Button href="https://github.com/rodrgds/productplate" variant="outline" size="lg">
							<Code2Icon data-icon="inline-start" />
							GitHub
						</Button>
						<Button href="#kickstart" variant="outline" size="lg">How Kickstart works</Button>
					</div>
				</div>

				<div class="relative lg:pl-4">
					<div
						class="absolute -inset-3 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-muted"
					></div>
					<div
						class="relative overflow-hidden rounded-2xl border bg-card shadow-xl shadow-foreground/5"
					>
						<div class="flex h-11 items-center border-b px-4">
							<div class="flex gap-1.5">
								<span class="size-2 rounded-full bg-red-400"></span>
								<span class="size-2 rounded-full bg-amber-400"></span>
								<span class="size-2 rounded-full bg-emerald-400"></span>
							</div>
							<span class="mx-auto pr-9 text-xs text-muted-foreground">START_HERE.md</span>
						</div>
						<div class="grid gap-4 p-4 sm:p-5">
							<div class="rounded-xl border bg-muted/35 p-4">
								<div class="flex items-center gap-2">
									<AppLogo class="size-7 rounded-lg" />
									<div>
										<p class="text-sm font-semibold">Kickstart prompt</p>
										<p class="mt-1 text-xs text-muted-foreground">
											The part most templates do not ship.
										</p>
									</div>
								</div>
								<div
									class="mt-5 grid gap-2 rounded-lg bg-background p-3 font-mono text-xs leading-6"
								>
									<p><span class="text-muted-foreground">$</span> clone productplate my-app</p>
									<p>
										<span class="text-muted-foreground">$</span> paste START_HERE.md into your agent
									</p>
									<p><span class="text-muted-foreground">agent</span> asks what you are building</p>
									<p>
										<span class="text-muted-foreground">agent</span> keeps the stack, removes the demo
									</p>
									<p>
										<span class="text-muted-foreground">agent</span> leaves a smaller product repo
									</p>
								</div>
							</div>

							<div class="grid gap-3 sm:grid-cols-3">
								{#each kickstartSteps as step, index (step.title)}
									<div class="rounded-xl border bg-background p-4">
										<p class="text-xs font-semibold text-muted-foreground">0{index + 1}</p>
										<p class="mt-2 text-sm font-semibold">{step.title}</p>
										<p class="mt-2 text-xs leading-5 text-muted-foreground">{step.detail}</p>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<div id="stack"><StackCloud /></div>

		<section id="kickstart" class="py-20 sm:py-28">
			<div class="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
				<div>
					<Badge variant="outline">Why it is different</Badge>
					<h2 class="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
						The prompt is part of the boilerplate.
					</h2>
					<p class="mt-5 text-lg leading-8 text-muted-foreground">
						Most starters stop after cloning. Product Plate includes a handoff prompt that asks the
						right questions, chooses one active stack, removes dead weight, and updates the repo for
						the product you are actually building.
					</p>
				</div>
				<div class="rounded-2xl border bg-card p-5 shadow-sm">
					<div class="grid gap-3">
						{#each ['Rename the app, constants, metadata, and README', 'Keep only the backend, auth, billing, and AI choices that fit', 'Remove demo account routes and unused showcase pages', 'Update AGENTS.md so the next agent sees the real product', 'Run the right checks and leave a clear handoff'] as item (item)}
							<div class="flex items-start gap-3 rounded-xl border bg-background px-4 py-3">
								<CheckIcon class="mt-0.5 size-4 shrink-0" />
								<p class="text-sm leading-6">{item}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<FeatureSection />
		<ProductRoutes />
		<PrincipleQuote />
		<OpenSourceSection />

		<section id="faq" class="py-20 sm:py-28">
			<div class="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[0.7fr_1.3fr]">
				<div>
					<Badge variant="outline">FAQ</Badge>
					<h2 class="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
						Questions, answered.
					</h2>
					<p class="mt-5 max-w-md text-base leading-7 text-muted-foreground">
						The short version: it is ordinary open-source code plus a practical AI handoff.
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
</style>
