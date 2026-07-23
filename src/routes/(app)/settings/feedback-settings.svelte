<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { Button } from '$lib/components/ui/button/index.js';
	import { feedbackFormSchema } from '$lib/forms/schemas';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { FeedbackForm } from '$lib/forms/schemas';

	interface Props {
		data: SuperValidated<FeedbackForm>;
	}

	let { data }: Props = $props();
	// The page owns this component, so the initial server form cannot change in place.
	// svelte-ignore state_referenced_locally
	const feedback = superForm(data, {
		validators: zodClient(feedbackFormSchema),
		resetForm: true
	});
	const { form, enhance, errors, message, submitting } = feedback;
</script>

<section class="max-w-2xl rounded-lg border p-5">
	{#if $message}
		<div role="status">
			<h3 class="text-lg font-semibold">Feedback sent</h3>
			<Button class="mt-5" variant="outline" onclick={() => ($message = undefined)}>
				Send more feedback
			</Button>
		</div>
	{:else}
		<h3 class="text-lg font-semibold">Send feedback</h3>
		<p class="mt-1 text-sm text-muted-foreground">Share a bug, idea, or question.</p>
		<form method="POST" action="?/feedback" use:enhance class="mt-5 space-y-4">
			<div class="space-y-2">
				<label for="feedback-category" class="text-sm font-medium">Category</label>
				<select
					id="feedback-category"
					name="category"
					bind:value={$form.category}
					class="h-10 w-full rounded-md border bg-background px-3 text-sm"
				>
					<option value="bug">Bug</option>
					<option value="idea">Idea</option>
					<option value="question">Question</option>
					<option value="other">Other</option>
				</select>
			</div>
			<div class="space-y-2">
				<label for="feedback-message" class="text-sm font-medium">Message</label>
				<textarea
					id="feedback-message"
					name="message"
					bind:value={$form.message}
					rows="5"
					maxlength="2000"
					required
					class="w-full rounded-md border bg-background p-3 text-sm"
				></textarea>
				{#if $errors.message}<p class="text-sm text-destructive">{$errors.message}</p>{/if}
			</div>
			<Button type="submit" disabled={$submitting}>
				{$submitting ? 'Sending…' : 'Send feedback'}
			</Button>
		</form>
	{/if}
</section>
