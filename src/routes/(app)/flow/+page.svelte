<script lang="ts">
	import { APP_NAME } from '$lib/constants.js';
	import { Background, BackgroundVariant, Controls, MiniMap, SvelteFlow } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { Edge, Node } from '@xyflow/svelte';
	import { mode } from 'mode-watcher';

	const nodes: Array<Node> = [
		{
			id: 'idea',
			position: { x: 0, y: 80 },
			data: { label: 'Idea' },
			type: 'input'
		},
		{
			id: 'prototype',
			position: { x: 260, y: 40 },
			data: { label: 'Prototype' }
		},
		{
			id: 'demo',
			position: { x: 520, y: 100 },
			data: { label: 'Demo' },
			type: 'output'
		}
	];

	const edges: Array<Edge> = [
		{ id: 'idea-prototype', source: 'idea', target: 'prototype', animated: true },
		{ id: 'prototype-demo', source: 'prototype', target: 'demo' }
	];
</script>

<svelte:head>
	<title>Flow | {APP_NAME}</title>
</svelte:head>

<header
	class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium">Flow</h1>
	</div>
</header>

<div class="h-[calc(100vh-4rem)] bg-background">
	<SvelteFlow {nodes} {edges} fitView colorMode={mode.current}>
		<Controls />
		<MiniMap />
		<Background variant={BackgroundVariant.Dots} />
	</SvelteFlow>
</div>
