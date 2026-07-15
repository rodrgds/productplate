<script lang="ts">
	import { APP_NAME } from '$lib/constants.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import Clock3Icon from '@lucide/svelte/icons/clock-3';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
</script>

<svelte:head>
	<title>Start a disposable demo | {APP_NAME}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Card.Root>
	<Card.Header>
		<div class="mb-2 flex size-10 items-center justify-center rounded-lg border bg-muted">
			<SparklesIcon />
		</div>
		<Card.Title>Explore a fresh workspace</Card.Title>
		<Card.Description>
			Create an isolated demo account only when you are ready to enter the application.
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<div class="flex items-start gap-3 text-sm">
			<Clock3Icon class="mt-0.5 text-primary" />
			<div>
				<p class="font-medium">Expires automatically</p>
				<p class="text-muted-foreground">
					The account and its workspace are removed after 24 hours.
				</p>
			</div>
		</div>
		<div class="flex items-start gap-3 text-sm">
			<ShieldCheckIcon class="mt-0.5 text-primary" />
			<div>
				<p class="font-medium">Safe evaluation mode</p>
				<p class="text-muted-foreground">
					Billing, invitations, and developer credentials are unavailable in demo accounts.
				</p>
			</div>
		</div>
	</Card.Content>
	<Card.Footer class="flex-col items-stretch gap-3">
		<form method="POST">
			<Button type="submit" size="lg" class="min-h-11 w-full">Create demo workspace</Button>
		</form>
		<p class="text-center text-xs text-muted-foreground">
			Creation is rate-limited to protect the hosted preview.
		</p>
	</Card.Footer>
</Card.Root>
