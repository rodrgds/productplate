<script lang="ts">
	import { APP_NAME } from '$lib/constants.js';
	import { Canvas, T } from '@threlte/core';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import SpinningModel from './spinning-model.svelte';
</script>

<svelte:head>
	<title>Threlte | {APP_NAME}</title>
</svelte:head>

<header
	class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium">Threlte</h1>
	</div>
</header>

<div class="h-[calc(100vh-4rem)] bg-muted/30">
	<Canvas>
		<T.PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
		<T.AmbientLight intensity={0.7} />
		<T.DirectionalLight position={[3, 4, 5]} intensity={2.4} />
		<SpinningModel />
	</Canvas>
</div>
