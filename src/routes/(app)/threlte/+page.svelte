<script lang="ts">
	import ActivityIcon from '@lucide/svelte/icons/activity';
	import BoxIcon from '@lucide/svelte/icons/box';
	import BoxesIcon from '@lucide/svelte/icons/boxes';
	import CircleDotIcon from '@lucide/svelte/icons/circle-dot';
	import GaugeIcon from '@lucide/svelte/icons/gauge';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import { APP_NAME } from '$lib/constants.js';
	import { Canvas, T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import SpinningModel from './spinning-model.svelte';

	type SceneMode = 'knot' | 'stack' | 'field';
	type MaterialMode = 'matte' | 'metal' | 'wire';

	interface SceneOption {
		id: SceneMode;
		label: string;
		description: string;
		icon: typeof CircleDotIcon;
		accent: string;
	}

	const sceneOptions: readonly SceneOption[] = [
		{
			id: 'knot',
			label: 'Knot',
			description: 'Hero-grade geometry with a single branded object.',
			icon: CircleDotIcon,
			accent: '#f97316'
		},
		{
			id: 'stack',
			label: 'Stack',
			description: 'Layered product blocks for configurators and previews.',
			icon: BoxesIcon,
			accent: '#18181b'
		},
		{
			id: 'field',
			label: 'Field',
			description: 'Spatial points for map, simulation, or analytics demos.',
			icon: BoxIcon,
			accent: '#14b8a6'
		}
	];

	const materialOptions: readonly { id: MaterialMode; label: string }[] = [
		{ id: 'matte', label: 'Matte' },
		{ id: 'metal', label: 'Metal' },
		{ id: 'wire', label: 'Wire' }
	];

	let mode = $state<SceneMode>('knot');
	let material = $state<MaterialMode>('matte');
	let speed = $state(0.65);

	let activeScene = $derived(sceneOptions.find((option) => option.id === mode) ?? sceneOptions[0]);
	let activeIndex = $derived(sceneOptions.findIndex((option) => option.id === mode) + 1);

	function resetScene() {
		mode = 'knot';
		material = 'matte';
		speed = 0.65;
	}
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
		<Button class="ml-auto" variant="outline" size="sm" onclick={resetScene}>
			<RotateCcwIcon data-icon="inline-start" />
			Reset
		</Button>
	</div>
</header>

<main
	class="min-h-[calc(100svh-4rem)] bg-muted/30 p-0 lg:h-[calc(100svh-4rem)] lg:min-h-0 lg:overflow-hidden lg:p-4"
>
	<div
		class="grid min-h-[calc(100svh-4rem)] gap-0 lg:h-full lg:min-h-0 lg:gap-4 xl:grid-cols-[minmax(0,1fr)_23rem]"
	>
		<section class="scene-panel" aria-label="Interactive Threlte scene">
			<div class="scene-header">
				<div>
					<Badge variant="outline">3D starter route</Badge>
					<h2>{activeScene.label} scene</h2>
					<p>{activeScene.description}</p>
				</div>
				<div class="scene-stat" aria-label="Active scene">
					<span>{activeIndex}</span>
					<p>of {sceneOptions.length}</p>
				</div>
			</div>

			<div class="canvas-wrap">
				<Canvas>
					<T.PerspectiveCamera makeDefault position={[0, 0.55, 5.1]} fov={45} />
					<OrbitControls
						enableDamping
						dampingFactor={0.08}
						enablePan={false}
						minDistance={2.7}
						maxDistance={8}
					/>
					<T.AmbientLight intensity={0.74} />
					<T.DirectionalLight position={[3.4, 4.8, 5.2]} intensity={2.35} />
					<T.DirectionalLight position={[-4, -2, 3]} intensity={0.7} />
					<SpinningModel {mode} {material} {speed} accent={activeScene.accent} />
				</Canvas>
			</div>
		</section>

		<aside class="control-panel" aria-label="Threlte controls">
			<section>
				<div class="panel-title">
					<ActivityIcon class="size-4" />
					<h2>Scene mode</h2>
				</div>
				<div class="mode-grid" role="group" aria-label="Scene mode">
					{#each sceneOptions as option (option.id)}
						<button
							type="button"
							class:active-mode={mode === option.id}
							aria-pressed={mode === option.id}
							onclick={() => (mode = option.id)}
						>
							<option.icon class="size-4" />
							<span>{option.label}</span>
						</button>
					{/each}
				</div>
			</section>

			<section>
				<div class="panel-title">
					<BoxIcon class="size-4" />
					<h2>Material</h2>
				</div>
				<div class="segmented" role="group" aria-label="Material">
					{#each materialOptions as option (option.id)}
						<button
							type="button"
							class:active-segment={material === option.id}
							aria-pressed={material === option.id}
							onclick={() => (material = option.id)}
						>
							{option.label}
						</button>
					{/each}
				</div>
			</section>

			<section>
				<label class="panel-title" for="scene-speed">
					<GaugeIcon class="size-4" />
					<span>Motion speed</span>
				</label>
				<div class="range-row">
					<input id="scene-speed" type="range" min="0" max="1.2" step="0.05" bind:value={speed} />
					<output for="scene-speed">{Math.round(speed * 100)}%</output>
				</div>
			</section>

			<section class="implementation-note">
				<h2>What this demonstrates</h2>
				<p>
					Canvas rendering stays isolated from the page controls, so downstream products can swap
					the model while keeping accessible settings, reset behavior, and reduced-motion support.
				</p>
			</section>
		</aside>
	</div>
</main>

<style>
	.scene-panel,
	.control-panel {
		border: 1px solid var(--border);
		background: var(--background);
		box-shadow: 0 1px 2px color-mix(in oklch, var(--foreground) 5%, transparent);
	}

	.scene-panel {
		display: flex;
		min-height: 0;
		flex-direction: column;
		overflow: hidden;
	}

	.scene-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid var(--border);
		padding: 1.25rem;
	}

	.scene-header h2 {
		margin: 0.75rem 0 0;
		font-size: 1.35rem;
		font-weight: 650;
	}

	.scene-header p {
		margin: 0.3rem 0 0;
		max-width: 34rem;
		color: var(--muted-foreground);
		font-size: 0.92rem;
		line-height: 1.6;
	}

	.scene-stat {
		display: grid;
		min-width: 4.5rem;
		place-items: center;
		border-radius: 0.85rem;
		background: var(--muted);
		padding: 0.85rem;
		text-align: center;
	}

	.scene-stat span {
		font-size: 1.5rem;
		font-weight: 700;
	}

	.scene-stat p {
		margin: 0;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--muted-foreground);
	}

	.canvas-wrap {
		flex: 1;
		min-height: 28rem;
		cursor: grab;
		background:
			linear-gradient(
				90deg,
				color-mix(in oklch, var(--foreground) 5%, transparent) 1px,
				transparent 1px
			),
			linear-gradient(color-mix(in oklch, var(--foreground) 5%, transparent) 1px, transparent 1px),
			linear-gradient(180deg, var(--background), var(--muted));
		background-size:
			4rem 4rem,
			4rem 4rem,
			100% 100%;
	}

	.canvas-wrap:active {
		cursor: grabbing;
	}

	.control-panel {
		display: grid;
		align-content: start;
		gap: 1.25rem;
		overflow: auto;
		padding: 1.25rem;
	}

	.control-panel section {
		display: grid;
		gap: 0.75rem;
	}

	.panel-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		color: var(--muted-foreground);
		font-size: 0.85rem;
		font-weight: 650;
	}

	.panel-title h2,
	.panel-title span {
		margin: 0;
		font-size: inherit;
		font-weight: inherit;
	}

	.mode-grid {
		display: grid;
		gap: 0.55rem;
	}

	.mode-grid button,
	.segmented button {
		border: 1px solid var(--border);
		background: var(--background);
		color: var(--foreground);
		font: inherit;
		transition:
			border-color 140ms ease,
			background-color 140ms ease,
			color 140ms ease;
	}

	.mode-grid button {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		border-radius: 0.75rem;
		padding: 0.75rem;
		font-size: 0.9rem;
		font-weight: 600;
		text-align: left;
	}

	.segmented {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		background: var(--muted);
		padding: 0.25rem;
	}

	.segmented button {
		min-height: 2rem;
		border-color: transparent;
		border-radius: 0.55rem;
		font-size: 0.82rem;
		font-weight: 650;
	}

	.mode-grid button:hover,
	.segmented button:hover {
		border-color: color-mix(in oklch, var(--primary) 45%, var(--border));
	}

	.active-mode,
	.active-segment {
		border-color: color-mix(in oklch, var(--primary) 55%, var(--border)) !important;
		background: color-mix(in oklch, var(--primary) 10%, var(--background)) !important;
		color: var(--foreground) !important;
	}

	.range-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 3.5rem;
		align-items: center;
		gap: 0.75rem;
	}

	input[type='range'] {
		accent-color: var(--primary);
		width: 100%;
	}

	output {
		border-radius: 0.6rem;
		background: var(--muted);
		padding: 0.35rem 0.45rem;
		text-align: center;
		font-size: 0.82rem;
		font-weight: 650;
	}

	.implementation-note {
		border-top: 1px solid var(--border);
		padding-top: 1rem;
	}

	.implementation-note h2 {
		margin: 0;
		font-size: 0.92rem;
		font-weight: 650;
	}

	.implementation-note p {
		margin: 0;
		color: var(--muted-foreground);
		font-size: 0.86rem;
		line-height: 1.6;
	}

	@media (max-width: 640px) {
		.scene-header {
			flex-direction: column;
		}

		.canvas-wrap {
			height: 24rem;
			flex: none;
			min-height: 24rem;
		}
	}

	@media (min-width: 1024px) {
		.scene-panel,
		.control-panel {
			border-radius: 1rem;
		}

		.control-panel {
			max-height: 100%;
		}
	}
</style>
