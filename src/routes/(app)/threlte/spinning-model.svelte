<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { onMount } from 'svelte';
	import type { Group } from 'three';

	type SceneMode = 'knot' | 'stack' | 'field';
	type MaterialMode = 'matte' | 'metal' | 'wire';
	type Vector3Tuple = [number, number, number];

	interface Props {
		mode?: SceneMode;
		speed?: number;
		material?: MaterialMode;
		accent?: string;
	}

	interface StackBlock {
		id: string;
		position: Vector3Tuple;
		rotation: Vector3Tuple;
		args: Vector3Tuple;
		color: string;
	}

	interface FieldPoint {
		id: string;
		position: Vector3Tuple;
		scale: Vector3Tuple;
		color: string;
	}

	let { mode = 'knot', speed = 0.65, material = 'matte', accent = '#f97316' }: Props = $props();

	let group = $state<Group>();
	let prefersReducedMotion = $state(false);

	const stackBlocks: readonly StackBlock[] = [
		{
			id: 'foundation',
			position: [-0.85, -0.75, 0],
			rotation: [0.15, 0.35, -0.18],
			args: [1.25, 0.34, 1],
			color: '#f97316'
		},
		{
			id: 'surface',
			position: [0.3, -0.25, 0.15],
			rotation: [-0.1, -0.28, 0.1],
			args: [1.3, 0.32, 0.9],
			color: '#18181b'
		},
		{
			id: 'signal',
			position: [-0.05, 0.32, -0.12],
			rotation: [0.22, 0.2, 0.14],
			args: [1.05, 0.3, 0.8],
			color: '#eab308'
		},
		{
			id: 'control',
			position: [0.75, 0.85, 0.05],
			rotation: [-0.18, 0.38, -0.08],
			args: [0.95, 0.28, 0.78],
			color: '#14b8a6'
		}
	];

	const fieldPoints: readonly FieldPoint[] = [
		{
			id: 'west',
			position: [-1.55, -0.55, 0.05],
			scale: [1.15, 1.15, 1.15],
			color: '#f97316'
		},
		{
			id: 'north',
			position: [-0.75, 0.2, -0.2],
			scale: [0.85, 0.85, 0.85],
			color: '#18181b'
		},
		{ id: 'center', position: [0.2, -0.2, 0.18], scale: [1, 1, 1], color: '#14b8a6' },
		{
			id: 'east',
			position: [0.95, 0.55, -0.08],
			scale: [0.75, 0.75, 0.75],
			color: '#eab308'
		},
		{
			id: 'south',
			position: [1.45, -0.62, 0.1],
			scale: [0.95, 0.95, 0.95],
			color: '#f97316'
		}
	];

	let roughness = $derived(material === 'metal' ? 0.18 : 0.62);
	let metalness = $derived(material === 'metal' ? 0.72 : 0.08);
	let isWireframe = $derived(material === 'wire');

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	useTask((delta) => {
		if (!group || prefersReducedMotion) return;

		const velocity = Math.max(0, Math.min(speed, 1.2));
		group.rotation.x += delta * velocity * 0.18;
		group.rotation.y += delta * (0.34 + velocity * 0.72);
	});
</script>

<T.Group bind:ref={group}>
	{#if mode === 'knot'}
		<T.Mesh>
			<T.TorusKnotGeometry args={[1, 0.32, 160, 22]} />
			<T.MeshStandardMaterial color={accent} {roughness} {metalness} wireframe={isWireframe} />
		</T.Mesh>
	{:else if mode === 'stack'}
		{#each stackBlocks as block (block.id)}
			<T.Mesh position={block.position} rotation={block.rotation}>
				<T.BoxGeometry args={block.args} />
				<T.MeshStandardMaterial
					color={block.color}
					{roughness}
					{metalness}
					wireframe={isWireframe}
				/>
			</T.Mesh>
		{/each}
	{:else}
		<T.Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]}>
			<T.PlaneGeometry args={[4.2, 3.2, 16, 12]} />
			<T.MeshStandardMaterial
				color="#f4f0e8"
				roughness={0.9}
				wireframe
				transparent
				opacity={0.42}
			/>
		</T.Mesh>
		{#each fieldPoints as point (point.id)}
			<T.Mesh position={point.position} scale={point.scale}>
				<T.SphereGeometry args={[0.16, 32, 18]} />
				<T.MeshStandardMaterial
					color={point.color}
					{roughness}
					{metalness}
					wireframe={isWireframe}
				/>
			</T.Mesh>
		{/each}
	{/if}
</T.Group>
