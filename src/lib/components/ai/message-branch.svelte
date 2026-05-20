<script lang="ts" module>
	import { getContext } from 'svelte';

	interface MessageBranchContextType {
		currentBranch: number;
		totalBranches: number;
		goToPrevious: () => void;
		goToNext: () => void;
		setTotalBranches: (count: number) => void;
	}

	export const messageBranchKey = Symbol('message-branch');

	export function useMessageBranch(): MessageBranchContextType {
		const context = getContext(messageBranchKey) as MessageBranchContextType | null;
		if (!context) {
			throw new Error('MessageBranch components must be used within MessageBranch');
		}
		return context;
	}
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { setContext } from 'svelte';
	import { cn } from '$lib/utils.js';

	let {
		defaultBranch = 0,
		onBranchChange,
		class: className,
		children
	}: HTMLAttributes<HTMLDivElement> & {
		defaultBranch?: number;
		onBranchChange?: (branchIndex: number) => void;
	} = $props();

	let currentBranch = $state(defaultBranch);
	let totalBranches = $state(0);

	function handleBranchChange(newBranch: number) {
		currentBranch = newBranch;
		onBranchChange?.(newBranch);
	}

	function goToPrevious() {
		const newBranch = currentBranch > 0 ? currentBranch - 1 : totalBranches - 1;
		handleBranchChange(newBranch);
	}

	function goToNext() {
		const newBranch = currentBranch < totalBranches - 1 ? currentBranch + 1 : 0;
		handleBranchChange(newBranch);
	}

	function setTotalBranches(count: number) {
		totalBranches = count;
	}

	setContext(messageBranchKey, {
		get currentBranch() {
			return currentBranch;
		},
		get totalBranches() {
			return totalBranches;
		},
		goToPrevious,
		goToNext,
		setTotalBranches
	});
</script>

<div class={cn('grid w-full gap-2 [&>div]:pb-0', className)}>
	{@render children?.()}
</div>
