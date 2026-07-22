<script lang="ts">
	import { resolve } from '$app/paths';
	import AppLogo from '$lib/components/app-logo.svelte';
	import { APP_NAME } from '$lib/constants';

	interface Props {
		brand?: string;
	}

	const groups = [
		{
			title: 'Starter',
			links: [
				{ label: 'Home', href: '/' },
				{ label: 'Docs', href: '/docs' },
				{ label: 'Changelog', href: '/changelog' },
				{ label: 'Showcase', href: '/showcase' }
			]
		},
		{
			title: 'Components',
			links: [
				{ label: 'All components', href: '/components' },
				{ label: 'Hero', href: '/components/hero' },
				{ label: 'Features', href: '/components/features' },
				{ label: 'Proof', href: '/components/proof' },
				{ label: 'Pricing', href: '/components/pricing' },
				{ label: 'FAQ', href: '/components/faq' }
			]
		},
		{
			title: 'Explore',
			links: [
				{ label: 'Theme builder', href: '/theme-builder' },
				{ label: 'Live demo', href: '/auth/demo' },
				{ label: 'Sign up', href: '/auth/sign-up' },
				{ label: 'Sign in', href: '/auth/sign-in' }
			]
		}
	] as const;

	let { brand = APP_NAME }: Props = $props();
</script>

<footer class="border-t py-12">
	<div class="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1fr_1.4fr]">
		<div>
			<a href={resolve('/')} class="flex items-center gap-3 font-semibold tracking-tight">
				<AppLogo class="size-8 rounded-lg" />
				<span>{brand}</span>
			</a>
			<p class="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
				A reusable Svelte landing library for founders who want source files, not a sealed kit.
			</p>
		</div>

		<div class="grid gap-8 sm:grid-cols-3">
			{#each groups as group (group.title)}
				<div>
					<p class="text-sm font-semibold">{group.title}</p>
					<ul class="mt-4 grid gap-3">
						{#each group.links as link (link.label)}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<li>
								<a
									href={resolve(link.href)}
									class="text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									{link.label}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</div>
</footer>
