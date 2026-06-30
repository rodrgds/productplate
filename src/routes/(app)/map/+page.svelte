<script lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';

	import type { StyleSpecification } from 'maplibre-gl';
	import { mode } from 'mode-watcher';
	import { MapLibre, Marker, NavigationControl, ScaleControl } from 'svelte-maplibre-gl';
	import { APP_NAME } from '$lib/constants.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	interface DemoMarker {
		id: string;
		label: string;
		coordinates: [number, number];
	}

	const demoMarkers: readonly DemoMarker[] = [
		{ id: 'san-francisco', label: 'San Francisco', coordinates: [-122.4194, 37.7749] },
		{ id: 'new-york', label: 'New York', coordinates: [-74.006, 40.7128] },
		{ id: 'london', label: 'London', coordinates: [-0.1276, 51.5072] },
		{ id: 'berlin', label: 'Berlin', coordinates: [13.405, 52.52] },
		{ id: 'singapore', label: 'Singapore', coordinates: [103.8198, 1.3521] }
	];

	const lightMapStyle = {
		version: 8,
		sources: {
			carto: {
				type: 'raster',
				tiles: [
					'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
					'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
					'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
					'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
				],
				tileSize: 256,
				attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
			}
		},
		layers: [
			{
				id: 'carto-light',
				type: 'raster',
				source: 'carto',
				minzoom: 0,
				maxzoom: 20
			}
		]
	} satisfies StyleSpecification;

	const darkMapStyle = {
		version: 8,
		sources: {
			carto: {
				type: 'raster',
				tiles: [
					'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
					'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
					'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
					'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
				],
				tileSize: 256,
				attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
			}
		},
		layers: [
			{
				id: 'carto-dark',
				type: 'raster',
				source: 'carto',
				minzoom: 0,
				maxzoom: 20
			}
		]
	} satisfies StyleSpecification;

	let mapStyle = $derived(mode.current === 'dark' ? darkMapStyle : lightMapStyle);
	let mapTheme = $derived(mode.current === 'dark' ? 'dark' : 'light');
</script>

<svelte:head>
	<title>Map | {APP_NAME}</title>
</svelte:head>

<header
	class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium">Map</h1>
	</div>
</header>

<main class="flex min-h-0 flex-1 bg-muted/20 p-0 lg:p-4">
	<section class="map-frame" data-map-theme={mapTheme} aria-label="Workspace map">
		<MapLibre
			class="app-map"
			style={mapStyle}
			center={[0, 35]}
			zoom={1.75}
			minZoom={1.15}
			maxZoom={12}
			attributionControl={false}
			autoloadGlobalCss={false}
		>
			<NavigationControl position="top-right" />
			<ScaleControl position="bottom-left" />
			{#each demoMarkers as marker (marker.id)}
				<Marker lnglat={marker.coordinates} anchor="center">
					{#snippet content()}
						<span class="map-dot" role="img" aria-label={`${marker.label} marker`}></span>
					{/snippet}
				</Marker>
			{/each}
		</MapLibre>
	</section>
</main>

<style>
	.map-frame {
		position: relative;
		isolation: isolate;
		flex: 1;
		min-height: calc(100svh - 4rem);
		overflow: hidden;
		background: var(--background);
		color: var(--foreground);
	}

	.map-frame :global(.app-map) {
		position: absolute;
		inset: 0;
		min-height: 100%;
	}

	.map-frame :global(.maplibregl-canvas) {
		outline: none;
	}

	.map-frame :global(.maplibregl-ctrl-top-right) {
		top: 1rem;
		right: 1rem;
	}

	.map-frame :global(.maplibregl-ctrl-bottom-left) {
		bottom: 1rem;
		left: 1rem;
	}

	.map-frame :global(.maplibregl-ctrl-group),
	.map-frame :global(.maplibregl-ctrl-scale) {
		border: 1px solid color-mix(in oklch, var(--border) 76%, transparent);
		background: color-mix(in oklch, var(--background) 86%, transparent);
		color: var(--foreground);
		box-shadow: 0 12px 28px color-mix(in oklch, var(--foreground) 10%, transparent);
		backdrop-filter: blur(14px);
	}

	.map-frame :global(.maplibregl-ctrl button span) {
		filter: none;
	}

	.map-dot {
		display: block;
		width: 0.9rem;
		height: 0.9rem;
		border: 2px solid var(--background);
		border-radius: 999px;
		background: var(--primary);
		box-shadow:
			0 0 0 0.35rem color-mix(in oklch, var(--primary) 18%, transparent),
			0 14px 28px color-mix(in oklch, var(--foreground) 18%, transparent);
	}

	@media (min-width: 1024px) {
		.map-frame {
			min-height: calc(100svh - 6rem);
			border: 1px solid var(--border);
			border-radius: 0.75rem;
		}
	}
</style>
