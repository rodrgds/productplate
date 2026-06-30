<script lang="ts">
	import { useRegisterSW } from 'virtual:pwa-register/svelte';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import { RefreshCw, X } from '@lucide/svelte';

	const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
		onRegistered(registration) {
			if (registration) {
				console.log('Service worker registered:', registration.scope);
			}
		},
		onRegisterError(error) {
			console.error('Service worker registration failed:', error);
		}
	});

	let quietRoute = $derived(
		page.url.pathname === '/' ||
			page.url.pathname === '/map' ||
			page.url.pathname.startsWith('/theme-builder')
	);
	let visible = $derived($needRefresh && !quietRoute);
</script>

{#if visible}
	<div
		class="fixed right-3 bottom-3 z-50 flex max-w-[calc(100vw-1.5rem)] animate-in items-center gap-2 rounded-full border bg-background/95 px-2 py-1.5 text-xs shadow-lg backdrop-blur fade-in slide-in-from-bottom-2"
	>
		<span class="px-2 font-medium whitespace-nowrap">Update available</span>
		<Button onclick={() => updateServiceWorker(true)} size="sm" class="h-7 rounded-full px-3">
			<RefreshCw class="size-3" />
			Reload
		</Button>
		<Button
			onclick={() => (offlineReady.set(false), needRefresh.set(false))}
			variant="ghost"
			size="icon"
			class="size-7 rounded-full"
			aria-label="Dismiss update prompt"
		>
			<X class="size-3" />
		</Button>
	</div>
{/if}
