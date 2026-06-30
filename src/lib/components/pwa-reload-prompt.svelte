<script lang="ts">
	import { useRegisterSW } from 'virtual:pwa-register/svelte';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { RefreshCw, X } from '@lucide/svelte';
	import { APP_NAME } from '$lib/constants';

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

	let visible = $derived($needRefresh && page.url.pathname !== '/');
</script>

{#if visible}
	<div class="fixed right-4 bottom-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-2">
		<Card.Root class="gap-0 py-0 shadow-lg">
			<Card.Content class="p-4">
				<div class="flex items-start gap-3">
					<div class="flex-1">
						<h4 class="text-sm font-semibold">Update available</h4>
						<p class="mt-1 text-xs text-muted-foreground">
							A new version of {APP_NAME} has been deployed. Reload to get the latest updates.
						</p>
					</div>
					<Button
						onclick={() => (offlineReady.set(false), needRefresh.set(false))}
						variant="ghost"
						size="icon"
						class="size-6 shrink-0"
					>
						<X class="size-3" />
					</Button>
				</div>
				{#if $needRefresh}
					<div class="mt-3 flex gap-2">
						<Button
							onclick={() => updateServiceWorker(true)}
							size="sm"
							variant="default"
							class="w-full"
						>
							<RefreshCw class="mr-1.5 size-3" />
							Reload now
						</Button>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
{/if}
