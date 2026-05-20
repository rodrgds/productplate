<script lang="ts" module>
	import { getContext } from 'svelte';

	type ConfirmationState =
		| 'approval-requested'
		| 'approval-responded'
		| 'input-available'
		| 'input-streaming'
		| 'output-available'
		| 'output-denied'
		| 'output-error';

	type ToolUIPartApproval =
		| { id: string; approved?: never; reason?: never }
		| { id: string; approved: boolean; reason?: string }
		| undefined;

	export interface ConfirmationContextValue {
		approval: ToolUIPartApproval;
		state: ConfirmationState;
	}

	export const confirmationKey = Symbol('confirmation');

	export function useConfirmation(): ConfirmationContextValue {
		const context = getContext(confirmationKey) as ConfirmationContextValue | null;
		if (!context) {
			throw new Error('Confirmation components must be used within Confirmation');
		}
		return context;
	}
</script>

<script lang="ts">
	import { Alert } from '$lib/components/ui/alert/index.js';
	import { cn } from '$lib/utils.js';
	import { setContext } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type ToolUIPartApproval =
		| { id: string; approved?: never; reason?: never }
		| { id: string; approved: boolean; reason?: string }
		| undefined;

	let {
		class: className,
		approval,
		state,
		children
	}: HTMLAttributes<HTMLDivElement> & {
		approval?: ToolUIPartApproval;
		state: ConfirmationContextValue['state'];
	} = $props();

	setContext(confirmationKey, {
		get approval() {
			return approval;
		},
		get state() {
			return state;
		}
	});
</script>

{#if approval && state !== 'input-streaming' && state !== 'input-available'}
	<Alert class={cn('flex flex-col gap-2', className)}>
		{@render children?.()}
	</Alert>
{/if}
