<script lang="ts">
	import MenuIcon from '@lucide/svelte/icons/menu';
	import XIcon from '@lucide/svelte/icons/x';
	import { resolve } from '$app/paths';
	import AppLogo from '$lib/components/app-logo.svelte';
	import { Button } from '$lib/components/ui/button';
	import { APP_NAME } from '$lib/constants';

	interface Props {
		brand?: string;
		ctaLabel?: string;
		ctaHref?: string;
	}

	const items = [
		{ label: 'Patterns', href: '/landing-components#patterns' },
		{ label: 'Proof', href: '/landing-components#proof' },
		{ label: 'Pricing', href: '/landing-components#pricing' },
		{ label: 'FAQ', href: '/landing-components#faq' }
	] as const;

	let {
		brand = APP_NAME,
		ctaLabel = 'Start building',
		ctaHref = resolve('/auth/sign-up')
	}: Props = $props();

	let open = $state(false);
</script>

<header
	class="sticky top-0 border-b bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/78"
>
	<nav aria-label="Landing components navigation" class="mx-auto max-w-7xl px-6">
		<div class="flex h-16 items-center justify-between gap-4">
			<a href={resolve('/')} class="flex items-center gap-3 font-semibold tracking-tight">
				<AppLogo class="size-8 rounded-lg" />
				<span>{brand}</span>
			</a>

			<div class="hidden items-center gap-7 text-sm md:flex">
				{#each items as item (item.label)}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a
						href={resolve(item.href)}
						class="text-muted-foreground transition-colors hover:text-foreground"
					>
						{item.label}
					</a>
				{/each}
			</div>

			<div class="hidden items-center gap-2 sm:flex">
				<Button href={resolve('/')} variant="ghost" size="sm">Back to home</Button>
				<Button href={ctaHref} size="sm">{ctaLabel}</Button>
			</div>

			<Button
				variant="ghost"
				size="icon"
				class="md:hidden"
				aria-label={open ? 'Close menu' : 'Open menu'}
				aria-expanded={open}
				onclick={() => (open = !open)}
			>
				{#if open}
					<XIcon />
				{:else}
					<MenuIcon />
				{/if}
			</Button>
		</div>

		{#if open}
			<div class="grid gap-2 border-t py-4 md:hidden">
				{#each items as item (item.label)}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a
						href={resolve(item.href)}
						class="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
						onclick={() => (open = false)}
					>
						{item.label}
					</a>
				{/each}
				<div class="grid gap-2 pt-2 sm:hidden">
					<Button href={resolve('/')} variant="outline" onclick={() => (open = false)}
						>Back to home</Button
					>
					<Button href={ctaHref} onclick={() => (open = false)}>{ctaLabel}</Button>
				</div>
			</div>
		{/if}
	</nav>
</header>
