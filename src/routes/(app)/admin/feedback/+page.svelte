<script lang="ts">
	import { api } from '$convex/_generated/api.js';
	import type { Id } from '$convex/_generated/dataModel.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { useConvexClient, useQuery } from 'convex-svelte';

	type FeedbackStatus = 'open' | 'in_progress' | 'closed';

	const client = useConvexClient();
	const feedbackResponse = useQuery(api.feedback.listForOperator, {});
	let feedback = $derived(feedbackResponse.data ?? []);
	let updatingId = $state<Id<'feedback'> | null>(null);

	async function updateStatus(feedbackId: Id<'feedback'>, status: FeedbackStatus) {
		updatingId = feedbackId;
		try {
			await client.mutation(api.feedback.setStatus, { feedbackId, status });
		} finally {
			updatingId = null;
		}
	}
</script>

<svelte:head>
	<title>Feedback</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<header class="flex h-14 items-center border-b px-4">
	<Sidebar.Trigger />
	<h1 class="ml-3 font-medium">Feedback</h1>
</header>

<main class="space-y-6 p-6 md:p-10">
	<div>
		<h2 class="text-3xl font-semibold">Customer feedback</h2>
		<p class="mt-2 text-muted-foreground">Review product feedback and keep its status current.</p>
	</div>
	{#if feedbackResponse.isLoading}
		<p class="text-sm text-muted-foreground">Loading feedback…</p>
	{:else if feedback.length === 0}
		<div class="rounded-lg border border-dashed p-8 text-sm text-muted-foreground">
			No feedback has been submitted.
		</div>
	{:else}
		<div class="grid gap-4">
			{#each feedback as item (item._id)}
				<article class="rounded-lg border p-5">
					<div class="flex flex-wrap items-center justify-between gap-3">
						<div>
							<p class="text-sm font-medium capitalize">{item.category}</p>
							<p class="mt-1 text-xs text-muted-foreground">
								{new Date(item.createdAt).toLocaleString()} · {item.currentPath}
							</p>
						</div>
						<label class="flex items-center gap-2 text-sm">
							<span class="sr-only">Status</span>
							<select
								class="h-9 rounded-md border bg-background px-3"
								value={item.status}
								disabled={updatingId === item._id}
								onchange={(event) =>
									updateStatus(item._id, event.currentTarget.value as FeedbackStatus)}
							>
								<option value="open">Open</option>
								<option value="in_progress">In progress</option>
								<option value="closed">Closed</option>
							</select>
						</label>
					</div>
					<p class="mt-4 text-sm leading-6 whitespace-pre-wrap">{item.message}</p>
					<p class="mt-4 font-mono text-xs text-muted-foreground">Request {item.requestId}</p>
				</article>
			{/each}
		</div>
	{/if}
</main>
