<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import type { Mesh } from 'three';

	let mesh = $state<Mesh>();

	useTask((delta) => {
		if (!mesh) return;
		mesh.rotation.x += delta * 0.35;
		mesh.rotation.y += delta * 0.55;
	});
</script>

<T.Mesh bind:ref={mesh}>
	<T.TorusKnotGeometry args={[1, 0.32, 128, 18]} />
	<T.MeshStandardMaterial color="#4f46e5" roughness={0.28} metalness={0.18} />
</T.Mesh>
