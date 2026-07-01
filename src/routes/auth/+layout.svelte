<script lang="ts">
	import { setContext } from 'svelte';
	import { resolve } from '$app/paths';
	import { APP_NAME, APP_YEAR, APP_LEGAL_NAME, APP_TAGLINE } from '$lib/constants.js';
	import AppLogo from '$lib/components/app-logo.svelte';

	let email = $state('');
	const { children } = $props();

	setContext('auth:email', {
		get: () => email,
		set: (v: string) => (email = v)
	});
</script>

<div class="relative grid min-h-screen lg:grid-cols-2">
	<div class="relative hidden flex-col justify-between bg-muted/50 p-10 lg:flex">
		<a
			href={resolve('/')}
			aria-label={`${APP_NAME} home`}
			class="inline-flex w-fit items-center gap-2 rounded-lg text-lg font-semibold transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
		>
			<div
				class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
			>
				<AppLogo class="size-4" />
			</div>
			{APP_NAME}
		</a>
		<div class="space-y-4">
			<blockquote class="space-y-2">
				<p class="text-lg leading-relaxed font-medium text-foreground/90">
					"The best way to predict the future is to invent it."
				</p>
				<footer class="text-sm text-muted-foreground">— Alan Kay</footer>
			</blockquote>
		</div>
		<p class="text-sm text-muted-foreground">
			&copy; {APP_YEAR}
			{APP_LEGAL_NAME}. {APP_TAGLINE}
		</p>
	</div>

	<div class="flex flex-col items-center justify-center p-4 lg:p-8">
		<div class="w-full max-w-sm">
			<a
				href={resolve('/')}
				aria-label={`${APP_NAME} home`}
				class="mb-8 inline-flex w-full items-center justify-center gap-2 rounded-lg transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none lg:hidden"
			>
				<div
					class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
				>
					<AppLogo class="size-4" />
				</div>
				<span class="text-lg font-semibold">{APP_NAME}</span>
			</a>
			{@render children()}
		</div>
	</div>
</div>
