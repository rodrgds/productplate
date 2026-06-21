<script lang="ts">
	import Code2Icon from '@lucide/svelte/icons/code-2';
	import { resolve } from '$app/paths';
	import AppLogo from '$lib/components/app-logo.svelte';

	const links = [
		{ title: 'Features', href: '#features' },
		{ title: 'Routes', href: '#routes' },
		{ title: 'Open source', href: '#open-source' },
		{ title: 'Sign in', href: resolve('/auth/sign-in') }
	] as const;
	const home = resolve('/');
</script>

<footer class="border-t bg-muted/35 py-12">
	<div
		class="mx-auto flex max-w-6xl flex-col gap-8 px-6 sm:flex-row sm:items-end sm:justify-between"
	>
		<div>
			<a
				href={home}
				aria-label="Product Plate home"
				class="inline-flex items-center gap-3 font-semibold"
			>
				<AppLogo class="size-8 rounded-lg" />
				<span>Product Plate</span>
			</a>
			<p class="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
				A production-minded SvelteKit SaaS starter for indie hackers and founders.
			</p>
			<p class="mt-5 text-xs text-muted-foreground">MIT licensed. Built with Svelte 5.</p>
		</div>
		<div class="flex flex-col gap-5 sm:items-end">
			<nav aria-label="Footer navigation" class="flex flex-wrap gap-x-6 gap-y-3 text-sm">
				{#each links as link (link.title)}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={link.href} class="text-muted-foreground transition-colors hover:text-foreground"
						>{link.title}</a
					>
				{/each}
			</nav>
			<a
				href="https://github.com/rodrgds/productplate"
				aria-label="Product Plate on GitHub"
				class="text-muted-foreground transition-colors hover:text-foreground"
			>
				<Code2Icon class="size-5" />
			</a>
		</div>
	</div>
</footer>
