<script lang="ts">
	import { resolve } from '$app/paths';
	import { ArrowRight, Lock, Zap } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { APP_NAME, APP_DESCRIPTION } from '$lib/constants.js';
	import AppLogo from '$lib/components/app-logo.svelte';

	const to = {
		signUp: resolve('/auth/sign-up'),
		signIn: resolve('/auth/sign-in'),
		dashboard: resolve('/dashboard')
	};

	const highlights = [
		{
			label: 'Auth',
			description: 'Email/password, resets, and protected routes are already wired.'
		},
		{
			label: 'Backend',
			description: 'Convex is in place for realtime data, functions, and storage.'
		},
		{
			label: 'UI',
			description: 'The app shell and component library are ready to reshape fast.'
		}
	] as const;
</script>

<svelte:head>
	<title>{APP_NAME}</title>
</svelte:head>

<section class="relative min-h-screen overflow-hidden bg-background">
	<div
		class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
	></div>
	<div
		class="pointer-events-none absolute top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full border border-border/60 bg-muted/20 blur-3xl"
	></div>

	<div class="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 sm:px-8 lg:px-10">
		<header class="flex items-center justify-between border-b pb-5">
			<div class="flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
					<AppLogo class="h-5 w-5" />
				</div>
				<div>
					<p class="text-sm font-medium">{APP_NAME}</p>
					<p class="text-sm text-muted-foreground">{APP_DESCRIPTION}</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={to.signIn}><Button variant="ghost" size="sm">Sign in</Button></a>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={to.dashboard}><Button size="sm">Open app</Button></a>
			</div>
		</header>

		<main class="flex flex-1 flex-col justify-center py-16">
			<div class="max-w-3xl">
				<div
					class="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-muted-foreground"
				>
					<Zap class="h-3.5 w-3.5" />
					<span>Template noise removed</span>
				</div>
				<h1 class="max-w-2xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
					Ready for whatever the theme turns out to be.
				</h1>
				<p class="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
					Keep the useful infrastructure. Replace the product story later.
				</p>
				<div class="mt-8 flex flex-wrap items-center gap-3">
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={to.signUp}>
						<Button size="lg">
							Start here
							<ArrowRight class="h-4 w-4" />
						</Button>
					</a>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={to.dashboard}><Button size="lg" variant="outline">Dashboard scaffold</Button></a>
				</div>
			</div>

			<div class="mt-16 grid gap-4 md:grid-cols-3">
				{#each highlights as item (item.label)}
					<div class="rounded-md border bg-background/80 p-5">
						<div class="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-muted">
							<Lock class="h-4 w-4 text-muted-foreground" />
						</div>
						<p class="text-sm font-medium">{item.label}</p>
						<p class="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
					</div>
				{/each}
			</div>
		</main>
	</div>
</section>
