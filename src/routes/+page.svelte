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
		{ label: 'Features', href: '#features' },
		{ label: 'Components', href: to.components },
		{ label: 'Open source', href: '#open-source' },
		{ label: 'FAQ', href: '#faq' }
	] as const;

	const launchSteps = [
		'Auth, billing, and Convex wired',
		'Product routes ready to reshape',
		'Landing sections in source',
		'Ship with Bun and Cloudflare'
	] as const;

	const pipeline = [36, 52, 49, 64, 71, 84] as const;

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
	<header class="border-b">
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
				<Button href={to.signIn} variant="ghost" size="sm" class="hidden sm:inline-flex"
					>Sign in</Button
				>
				<Button href={to.signUp} variant="outline" size="sm" class="hidden sm:inline-flex"
					>Create account</Button
				>
				<Button href={to.demo} size="sm" class="hidden sm:inline-flex">
					Use demo
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
								variant="ghost"
								class="w-full"
								onclick={() => (mobileNavOpen = false)}>Sign in</Button
							>
							<Button
								href={to.signUp}
								variant="outline"
								class="w-full"
								onclick={() => (mobileNavOpen = false)}>Create account</Button
							>
							<Button href={to.demo} class="w-full" onclick={() => (mobileNavOpen = false)}>
								Use demo
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
						<Button href={to.demo} size="lg">
							Use demo account
							<ArrowRightIcon data-icon="inline-end" />
						</Button>
						<Button href={to.signUp} variant="outline" size="lg">Create account</Button>
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
					<div
						class="relative overflow-hidden rounded-2xl border bg-card shadow-xl shadow-foreground/5"
					>
						<div class="flex h-11 items-center border-b px-4">
							<div class="flex gap-1.5">
								<span class="size-2 rounded-full bg-muted-foreground/25"></span>
								<span class="size-2 rounded-full bg-muted-foreground/25"></span>
								<span class="size-2 rounded-full bg-muted-foreground/25"></span>
							</div>
							<span class="mx-auto pr-9 text-xs text-muted-foreground">productplate.pages.dev</span>
						</div>
						<div class="grid min-h-96 gap-4 p-4 sm:p-5 lg:grid-cols-[0.88fr_1.12fr]">
							<div class="rounded-xl border bg-muted/35 p-4">
								<div class="flex items-center gap-2">
									<AppLogo class="size-7 rounded-lg" />
									<div>
										<p class="text-sm font-semibold">Launch workspace</p>
										<p class="mt-1 text-xs text-muted-foreground">Foundation status</p>
									</div>
								</div>
								<div class="mt-5 grid gap-3">
									{#each launchSteps as step (step)}
										<div
											class="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm"
										>
											<CheckIcon class="size-4 shrink-0" />
											<span>{step}</span>
										</div>
									{/each}
								</div>
							</div>
							<div class="grid gap-4">
								<div class="rounded-xl border p-4">
									<div class="flex items-center justify-between gap-3">
										<div>
											<p class="text-sm font-semibold">Starter readiness</p>
											<p class="mt-1 text-xs text-muted-foreground">Routes, backend, UI, deploy</p>
										</div>
										<Badge variant="secondary">Ready</Badge>
									</div>
									<div class="mt-6 flex h-28 items-end gap-2">
										{#each pipeline as value, index (index)}
											<div
												class="min-w-2 flex-1 rounded-t-sm bg-primary"
												style={`height: ${value}%`}
											></div>
										{/each}
									</div>
								</div>
								<div class="rounded-xl border bg-primary p-4 text-primary-foreground">
									<p class="text-sm font-semibold">Marketing sections added</p>
									<p class="mt-2 text-sm leading-6 text-primary-foreground/75">
										Hero, proof, features, pricing, FAQ, and CTA examples now live in source.
									</p>
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
					<h2 class="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
						Questions, answered.
					</h2>
					<p class="mt-5 max-w-md text-base leading-7 text-muted-foreground">
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
</style>
