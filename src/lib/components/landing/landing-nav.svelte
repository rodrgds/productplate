<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import Code2Icon from '@lucide/svelte/icons/code-2';
	import LogInIcon from '@lucide/svelte/icons/log-in';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import PlayIcon from '@lucide/svelte/icons/play';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import { resolve } from '$app/paths';
	import AppLogo from '$lib/components/app-logo.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { APP_NAME } from '$lib/constants';

	interface Props {
		active?: 'theme-builder' | 'components';
	}

	const navItems = [
		{ key: 'product', label: 'Product', href: '/#product' },
		{ key: 'kickstart', label: 'Kickstart', href: '/#kickstart' },
		{ key: 'stack', label: 'Stack', href: '/#stack' },
		{ key: 'theme-builder', label: 'Theme Builder', href: '/theme-builder' },
		{ key: 'components', label: 'Components', href: '/components' },
		{ key: 'faq', label: 'FAQ', href: '/#faq' }
	] as const;

	const sourceUrl = 'https://github.com/rodrgds/productplate';
	const entryItems = [
		{ label: 'Sign in', href: '/auth/sign-in', icon: LogInIcon },
		{ label: 'Sign up', href: '/auth/sign-up', icon: UserPlusIcon },
		{ label: 'Open live demo', href: '/auth/demo', icon: PlayIcon }
	] as const;

	let { active }: Props = $props();
	let mobileNavOpen = $state(false);
	let enterOpen = $state(false);

	function closeMenus() {
		mobileNavOpen = false;
		enterOpen = false;
	}
</script>

<header
	class="sticky top-0 z-[120] border-b bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/78"
>
	<nav aria-label="Public navigation" class="mx-auto max-w-7xl px-5 sm:px-8">
		<div class="flex h-16 items-center justify-between gap-4">
			<a
				href={resolve('/')}
				aria-label="Product Plate home"
				class="flex items-center gap-3 font-semibold tracking-tight"
			>
				<AppLogo class="size-8 rounded-lg" />
				<span>{APP_NAME}</span>
			</a>

			<div class="hidden items-center gap-7 text-sm lg:flex">
				{#each navItems as item (item.key)}
					<a
						href={resolve(item.href)}
						aria-current={active === item.key ? 'page' : undefined}
						class="text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground"
					>
						{item.label}
					</a>
				{/each}
			</div>

			<div class="hidden items-center gap-2 sm:flex">
				<Button href={sourceUrl} variant="ghost" size="sm">
					<Code2Icon data-icon="inline-start" />
					View source
				</Button>
				<Popover.Root bind:open={enterOpen}>
					<Popover.Trigger>
						<Button variant="default" size="sm" aria-label="Open entry menu">
							Enter
							<ChevronDownIcon data-icon="inline-end" />
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-56" align="end">
						<div class="grid gap-1">
							{#each entryItems as item (item.label)}
								<a
									href={resolve(item.href)}
									class="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
									onclick={closeMenus}
								>
									<item.icon class="size-4" />
									<span>{item.label}</span>
									{#if item.label === 'Open live demo'}
										<ArrowRightIcon class="ml-auto size-4" />
									{/if}
								</a>
							{/each}
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>

			<Sheet.Root bind:open={mobileNavOpen}>
				<Sheet.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="ghost"
							size="icon"
							class="lg:hidden"
							aria-label="Open navigation"
						>
							<MenuIcon />
						</Button>
					{/snippet}
				</Sheet.Trigger>
				<Sheet.Content side="right" class="w-72 sm:w-80">
					<Sheet.Header>
						<Sheet.Title>{APP_NAME}</Sheet.Title>
						<Sheet.Description
							>Open the starter, tune the theme, or enter the demo.</Sheet.Description
						>
					</Sheet.Header>
					<div class="grid gap-1 px-4">
						{#each navItems as item (item.key)}
							<a
								href={resolve(item.href)}
								aria-current={active === item.key ? 'page' : undefined}
								class="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
								onclick={closeMenus}
							>
								{item.label}
							</a>
						{/each}
					</div>
					<div class="mt-5 grid gap-2 border-t px-4 pt-5">
						<Button href={sourceUrl} variant="outline" onclick={closeMenus}>
							<Code2Icon data-icon="inline-start" />
							View source
						</Button>
						{#each entryItems as item (item.label)}
							<Button
								href={resolve(item.href)}
								variant={item.label === 'Open live demo' ? 'default' : 'secondary'}
								onclick={closeMenus}
							>
								<item.icon data-icon="inline-start" />
								{item.label}
							</Button>
						{/each}
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</nav>
</header>
