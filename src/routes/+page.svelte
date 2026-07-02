<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import Code2Icon from '@lucide/svelte/icons/code-2';
	import TerminalIcon from '@lucide/svelte/icons/terminal';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import AppLogo from '$lib/components/app-logo.svelte';
	import LandingNav from '$lib/components/landing/landing-nav.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		APP_DESCRIPTION,
		APP_NAME,
		APP_OG_IMAGE_URL,
		APP_SOCIAL_DESCRIPTION,
		APP_SOCIAL_TITLE,
		APP_TWITTER_CARD,
		APP_URL
	} from '$lib/constants';

	let { data }: { data: PageData } = $props();

	const githubUrl = 'https://github.com/rodrgds/productplate';
	const docsUrl = 'https://github.com/rodrgds/productplate/blob/main/README.md';
	const securityUrl = 'https://github.com/rodrgds/productplate/blob/main/SECURITY.md';
	const kickstartUrl = 'https://github.com/rodrgds/productplate/blob/main/START_HERE.md';
	const to = {
		demo: resolve('/auth/demo')
	};

	const productSurfaces = [
		{
			number: '01',
			title: 'A real authenticated app shell',
			detail: 'Dashboard, profile, settings, admin, onboarding, and protected route patterns.'
		},
		{
			number: '02',
			title: 'Serious product building blocks',
			detail: 'Forms, tables, charts, uploads, rich text, graph UI, 3D, and streaming AI.'
		},
		{
			number: '03',
			title: 'The backend is already connected',
			detail: 'Convex data, Better Auth, Autumn billing, storage, tests, and Cloudflare deployment.'
		}
	] as const;

	const kickstartSteps = [
		{
			number: '1',
			title: 'Describe the product',
			detail: 'Give the agent the name, audience, launch goal, and visual direction.'
		},
		{
			number: '2',
			title: 'Choose what stays',
			detail: 'Keep only the routes, integrations, and product patterns that fit the idea.'
		},
		{
			number: '3',
			title: 'Ship a smaller repo',
			detail:
				'The agent renames, rewrites, removes demo surfaces, updates docs, and verifies the result.'
		}
	] as const;

	const stackRows = [
		{
			label: 'Application',
			value: 'SvelteKit 2, Svelte 5, TypeScript, Tailwind CSS v4, shadcn-svelte'
		},
		{ label: 'Backend', value: 'Convex functions, realtime data, storage, typed APIs' },
		{
			label: 'Accounts',
			value: 'Better Auth with email, password, OAuth wiring, and protected routes'
		},
		{ label: 'Revenue', value: 'Autumn billing with checkout and customer portal patterns' },
		{ label: 'AI', value: 'Vercel AI SDK, streaming assistant UI, Markdown, and tool calls' },
		{ label: 'Delivery', value: 'Bun, Vitest, Playwright, PWA support, and Cloudflare Pages' }
	] as const;

	const stackLogos = [
		{ name: 'SvelteKit', src: '/stack/svelte.svg' },
		{ name: 'Convex', src: '/stack/convex.png' },
		{ name: 'Better Auth', src: '/stack/better-auth.svg' },
		{ name: 'Autumn', src: '/stack/autumn.svg' },
		{ name: 'Tailwind CSS', src: '/stack/tailwindcss.svg' },
		{ name: 'AI SDK', src: '/stack/aisdk.png' },
		{ name: 'TypeScript', src: '/stack/typescript.svg' },
		{ name: 'Bun', src: '/stack/bun.svg' },
		{ name: 'Cloudflare', src: '/stack/cloudflare.svg' }
	] as const;

	const faq = [
		{
			question: 'Is this another generic SaaS template?',
			answer:
				'It is a working starter, but it is designed to stop looking like one quickly. START_HERE.md gives your coding agent a concrete process for choosing one product shape, deleting the unused surfaces, and updating the repo around the product you are actually building.'
		},
		{
			question: 'What can I remove safely?',
			answer:
				'Billing, AI, the editor, graph, 3D, admin, and the public demo are intentionally separated. The kickstart flow asks which pieces matter, then removes the rest instead of leaving a permanent showcase app.'
		},
		{
			question: 'What works before I customize it?',
			answer:
				'Authentication, onboarding, profiles, protected routes, billing scaffolding, realtime Convex data, file uploads, AI chat patterns, tests, PWA support, and Cloudflare deployment configuration are already in the repository.'
		},
		{
			question: 'Do I need to adopt a framework on top of SvelteKit?',
			answer:
				'No. Product Plate is ordinary SvelteKit and Convex application code. The components and routes are yours to edit, move, or delete.'
		},
		{
			question: 'Can I use it commercially?',
			answer: 'Yes. Product Plate is MIT licensed for personal, commercial, and open-source work.'
		}
	] as const;
</script>

<svelte:head>
	<title>{APP_NAME} | SvelteKit starter for real products</title>
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
	<meta property="og:image:alt" content="Product Plate SvelteKit product starter" />
	<meta name="twitter:card" content={APP_TWITTER_CARD} />
	<meta name="twitter:title" content={APP_SOCIAL_TITLE} />
	<meta name="twitter:description" content={APP_SOCIAL_DESCRIPTION} />
	<meta name="twitter:image" content={APP_OG_IMAGE_URL} />
</svelte:head>

<a
	href="#main-content"
	class="sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:block focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:shadow-lg"
>
	Skip to content
</a>

<div class="min-h-screen overflow-x-hidden bg-background text-foreground">
	<LandingNav isAuthenticated={data.isAuthenticated} />

	<main id="main-content">
		<section class="relative border-b">
			<div class="landing-grid pointer-events-none absolute inset-0"></div>
			<div class="relative mx-auto max-w-7xl px-5 pt-12 pb-8 sm:px-8 sm:pt-16 lg:pt-18">
				<div class="max-w-4xl">
					<Badge variant="outline" class="bg-background">
						<span class="size-1.5 rounded-full bg-[var(--signal)]"></span>
						Open source, MIT licensed
					</Badge>
					<h1
						class="mt-6 text-5xl leading-[1.02] font-semibold text-balance sm:text-6xl lg:text-7xl"
					>
						SvelteKit starter, ready to become your product.
					</h1>
					<p class="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
						Auth, billing, realtime data, AI, product UI, tests, and deployment are already wired. A
						practical kickstart prompt helps your coding agent keep what matters and remove what
						does not.
					</p>
					<div class="mt-7 flex flex-wrap gap-3">
						<Button href={to.demo} size="lg">
							Open live demo
							<ArrowRightIcon data-icon="inline-end" />
						</Button>
						<Button href={githubUrl} variant="outline" size="lg">
							<Code2Icon data-icon="inline-start" />
							View source
						</Button>
					</div>
					<div class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
						<span class="flex items-center gap-2"><CheckIcon class="size-4" /> Bun-native</span>
						<span class="flex items-center gap-2"><CheckIcon class="size-4" /> Type-safe</span>
						<span class="flex items-center gap-2"
							><CheckIcon class="size-4" /> Production-minded</span
						>
					</div>
				</div>

				<div
					class="mt-9 overflow-hidden rounded-xl border bg-card p-2 shadow-[0_24px_70px_oklch(0.2_0.006_95/0.12)] sm:p-3"
				>
					<div class="flex h-9 items-center gap-2 border-b px-2 sm:px-3">
						<span class="size-2 rounded-full bg-[oklch(0.7_0.18_28)]"></span>
						<span class="size-2 rounded-full bg-[oklch(0.8_0.16_85)]"></span>
						<span class="size-2 rounded-full bg-[oklch(0.7_0.16_150)]"></span>
						<span class="ml-2 text-xs text-muted-foreground">productplate.pages.dev/dashboard</span>
					</div>
					<img
						src="/screenshots/dashboard.png"
						alt="Product Plate dashboard with analytics and an AI workbench"
						class="mt-2 block h-auto w-full rounded-md border"
						width="1440"
						height="1100"
						fetchpriority="high"
					/>
				</div>
			</div>

			<div class="relative border-t bg-background">
				<div class="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-5 py-4 sm:px-8">
					<span class="mr-3 text-sm font-medium text-muted-foreground">Built on</span>
					{#each stackLogos as logo (logo.name)}
						<div
							class="flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-sm font-medium"
						>
							<img
								src={logo.src}
								alt=""
								class="size-4 object-contain {logo.name === 'Better Auth'
									? 'dark:brightness-0 dark:invert'
									: ''}"
								width="16"
								height="16"
							/>
							<span>{logo.name}</span>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<section id="product" class="py-20 sm:py-28">
			<div class="mx-auto max-w-7xl px-5 sm:px-8">
				<div class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
					<div>
						<p class="text-sm font-semibold text-[var(--signal)]">What is already here</p>
						<h2 class="mt-4 text-4xl leading-tight font-semibold text-balance sm:text-5xl">
							A working product, not a feature checklist.
						</h2>
						<p class="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
							Open the demo and inspect real routes. Product Plate is useful because the pieces
							already work together, not because the homepage lists more logos.
						</p>
					</div>
					<div class="divide-y border-y">
						{#each productSurfaces as surface (surface.number)}
							<div class="grid grid-cols-[3rem_1fr] gap-4 py-6 sm:grid-cols-[4rem_1fr] sm:py-7">
								<span class="text-sm font-semibold text-[var(--signal)]">{surface.number}</span>
								<div>
									<h3 class="text-lg font-semibold">{surface.title}</h3>
									<p class="mt-2 max-w-xl leading-7 text-muted-foreground">{surface.detail}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="mt-14 grid items-start gap-5 lg:grid-cols-[1.08fr_0.92fr]">
					<figure class="self-start overflow-hidden rounded-lg border bg-card p-2">
						<img
							src="/screenshots/onboarding-filled.png"
							alt="Product Plate onboarding flow"
							class="block aspect-[4/3] w-full rounded-md border object-cover object-top"
							width="1440"
							height="1100"
							loading="lazy"
						/>
						<figcaption class="px-2 pt-3 pb-1 text-sm text-muted-foreground">
							Onboarding and profile creation
						</figcaption>
					</figure>
					<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
						<figure class="overflow-hidden rounded-lg border bg-card p-2">
							<img
								src="/screenshots/editor.png"
								alt="Product Plate rich text editor"
								class="block aspect-[16/9] w-full rounded-md border object-cover object-top"
								width="1440"
								height="1100"
								loading="lazy"
							/>
							<figcaption class="px-2 pt-3 pb-1 text-sm text-muted-foreground">
								Rich text and upload patterns
							</figcaption>
						</figure>
						<figure class="overflow-hidden rounded-lg border bg-card p-2">
							<img
								src="/screenshots/flow.png"
								alt="Product Plate workflow editor"
								class="block aspect-[16/9] w-full rounded-md border object-cover object-top"
								width="1440"
								height="1100"
								loading="lazy"
							/>
							<figcaption class="px-2 pt-3 pb-1 text-sm text-muted-foreground">
								Graph and workflow foundations
							</figcaption>
						</figure>
					</div>
				</div>
			</div>
		</section>

		<section id="kickstart" class="bg-[var(--signal)] text-[var(--signal-foreground)]">
			<div
				class="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-20"
			>
				<div>
					<p class="text-sm font-semibold text-[var(--signal-soft)]">The useful difference</p>
					<h2 class="mt-4 text-4xl leading-tight font-semibold text-balance sm:text-5xl">
						Clone it. Brief it. Make it yours.
					</h2>
					<p
						class="mt-5 max-w-xl text-lg leading-8 text-[color-mix(in_oklch,var(--signal-foreground)_72%,transparent)]"
					>
						Most starters leave you with a renamed dashboard. Product Plate includes
						<code class="font-mono text-base">START_HERE.md</code>, a concrete brief that turns the
						template into the first coherent version of your product.
					</p>
					<div class="mt-8">
						<Button href={kickstartUrl} variant="secondary" size="lg">
							<TerminalIcon data-icon="inline-start" />
							Read the kickstart prompt
						</Button>
					</div>
				</div>

				<div
					class="divide-y divide-[color-mix(in_oklch,var(--signal-foreground)_18%,transparent)] border-y border-[color-mix(in_oklch,var(--signal-foreground)_18%,transparent)]"
				>
					{#each kickstartSteps as step (step.number)}
						<div class="grid grid-cols-[3rem_1fr] gap-4 py-6 sm:grid-cols-[4rem_1fr]">
							<span class="font-mono text-sm text-[var(--signal-soft)]"
								>{step.number.padStart(2, '0')}</span
							>
							<div>
								<h3 class="text-lg font-semibold">{step.title}</h3>
								<p
									class="mt-2 leading-7 text-[color-mix(in_oklch,var(--signal-foreground)_72%,transparent)]"
								>
									{step.detail}
								</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<section id="stack" class="border-b py-20 sm:py-28">
			<div class="mx-auto max-w-7xl px-5 sm:px-8">
				<div class="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
					<div>
						<p class="text-sm font-semibold text-[var(--signal)]">Default stack</p>
						<h2 class="mt-4 text-4xl leading-tight font-semibold text-balance sm:text-5xl">
							Opinionated where it saves time.
						</h2>
						<p class="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
							The defaults form one working path. Alternative data and billing scaffolds stay
							inactive until the kickstart process selects them.
						</p>
					</div>
					<div class="border-t">
						{#each stackRows as row (row.label)}
							<div class="grid gap-2 border-b py-5 sm:grid-cols-[9rem_1fr] sm:gap-6">
								<h3 class="text-sm font-semibold">{row.label}</h3>
								<p class="leading-7 text-muted-foreground">{row.value}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<section class="py-20 sm:py-28">
			<div class="mx-auto max-w-7xl px-5 sm:px-8">
				<div class="max-w-3xl">
					<p class="text-sm font-semibold text-[var(--signal)]">One repository, three jobs</p>
					<h2 class="mt-4 text-4xl leading-tight font-semibold text-balance sm:text-5xl">
						Evaluate it, shape it, then build.
					</h2>
				</div>
				<div class="mt-12 grid border-y md:grid-cols-3 md:divide-x">
					<div class="py-7 md:pr-8">
						<span class="font-mono text-sm text-[var(--signal)]">01</span>
						<h3 class="mt-5 text-xl font-semibold">Open the demo</h3>
						<p class="mt-3 leading-7 text-muted-foreground">
							Inspect the app shell, onboarding, billing, editor, graph, and AI workbench before you
							adopt anything.
						</p>
					</div>
					<div class="border-t py-7 md:border-t-0 md:px-8">
						<span class="font-mono text-sm text-[var(--signal)]">02</span>
						<h3 class="mt-5 text-xl font-semibold">Run the kickstart</h3>
						<p class="mt-3 leading-7 text-muted-foreground">
							Answer four product questions and approve a focused keep, remove, and reshape plan.
						</p>
					</div>
					<div class="border-t py-7 md:border-t-0 md:pl-8">
						<span class="font-mono text-sm text-[var(--signal)]">03</span>
						<h3 class="mt-5 text-xl font-semibold">Own ordinary code</h3>
						<p class="mt-3 leading-7 text-muted-foreground">
							Continue with familiar SvelteKit routes, Convex functions, TypeScript, and your own
							product decisions.
						</p>
					</div>
				</div>
			</div>
		</section>

		<section id="faq" class="border-y bg-muted/45 py-20 sm:py-28">
			<div
				class="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20"
			>
				<div>
					<p class="text-sm font-semibold text-[var(--signal)]">FAQ</p>
					<h2 class="mt-4 text-4xl leading-tight font-semibold text-balance sm:text-5xl">
						Before you fork.
					</h2>
					<p class="mt-5 max-w-md text-lg leading-8 text-muted-foreground">
						The short version: it is open-source product code with a disciplined path out of
						template mode.
					</p>
				</div>
				<Accordion.Root type="single" class="w-full" value="item-1">
					{#each faq as item, index (item.question)}
						<Accordion.Item value={`item-${index + 1}`}>
							<Accordion.Trigger class="text-left text-base">{item.question}</Accordion.Trigger>
							<Accordion.Content class="max-w-2xl text-base leading-7 text-muted-foreground">
								{item.answer}
							</Accordion.Content>
						</Accordion.Item>
					{/each}
				</Accordion.Root>
			</div>
		</section>

		<section class="bg-foreground text-background">
			<div
				class="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 sm:py-20 md:flex-row md:items-end"
			>
				<div>
					<p class="text-sm font-semibold text-background/65">Start from something real</p>
					<h2 class="mt-4 max-w-2xl text-4xl leading-tight font-semibold text-balance sm:text-5xl">
						Spend the first week on the product.
					</h2>
				</div>
				<div class="flex flex-wrap gap-3">
					<Button href={to.demo} variant="secondary" size="lg">
						Open live demo
						<ArrowRightIcon data-icon="inline-end" />
					</Button>
					<Button
						href={githubUrl}
						variant="outline"
						size="lg"
						class="border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background"
					>
						View source
					</Button>
				</div>
			</div>
		</section>
	</main>

	<footer>
		<div
			class="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-muted-foreground sm:px-8 md:flex-row md:items-center md:justify-between"
		>
			<div class="flex items-center gap-3 text-foreground">
				<AppLogo class="size-7 rounded-md" />
				<span class="font-semibold">Product Plate</span>
				<span class="text-muted-foreground">MIT licensed</span>
			</div>
			<div class="flex flex-wrap gap-x-6 gap-y-2">
				<a href={githubUrl} class="hover:text-foreground">GitHub</a>
				<a href={resolve('/components')} class="hover:text-foreground">Components</a>
				<a href={docsUrl} class="hover:text-foreground">Documentation</a>
				<a href={securityUrl} class="hover:text-foreground">Security</a>
			</div>
		</div>
	</footer>
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
		background-size: 48px 48px;
		mask-image: linear-gradient(to bottom, black, transparent 68%);
		opacity: 0.65;
	}
</style>
