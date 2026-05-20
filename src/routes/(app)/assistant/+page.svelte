<script lang="ts">
	import { APP_NAME } from '$lib/constants.js';
	import AgentPanel from '$lib/components/ai/agent-panel.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
</script>

<svelte:head>
	<title>Assistant | {APP_NAME}</title>
</svelte:head>

<header
	class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium">Assistant</h1>
	</div>
</header>

<div class="flex flex-1 flex-col p-4 lg:p-6">
	<div class="mx-auto flex w-full max-w-4xl flex-1 flex-col">
		<AgentPanel />
	</div>
</div>
