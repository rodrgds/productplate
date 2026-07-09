<script lang="ts">
	import { browser } from '$app/environment';
	import {
		createInitialThemePresetExpression,
		defaultThemePreset,
		encodeThemePreset,
		getThemeRuntimeCss,
		parseThemePreset,
		themePresetChangeEvent,
		themePresetStorageKey,
		themeRuntimeStyleElementId
	} from '$lib/theme-builder.js';

	const defaultPresetCode = encodeThemePreset(defaultThemePreset);
	const initialThemePresetScript = `<script>${createInitialThemePresetExpression()}<` + '/script>';

	function writeTheme(code: string | null | undefined) {
		if (!browser) return;

		const parsedPreset = parseThemePreset(code);
		const preset = parsedPreset ?? defaultThemePreset;
		const normalizedPresetCode =
			parsedPreset === null
				? defaultPresetCode
				: (code ?? defaultPresetCode).trim().replace(/^--preset\s+/, '');
		let styleElement = document.getElementById(
			themeRuntimeStyleElementId
		) as HTMLStyleElement | null;

		if (!styleElement) {
			styleElement = document.createElement('style');
			styleElement.id = themeRuntimeStyleElementId;
			document.head.appendChild(styleElement);
		}

		styleElement.textContent = getThemeRuntimeCss(preset);
		document.documentElement.dataset.productPlatePreset = normalizedPresetCode;
	}

	$effect(() => {
		if (!browser) return;

		writeTheme(localStorage.getItem(themePresetStorageKey));

		const handleThemeChange = (event: Event) => {
			const detail = (event as CustomEvent<string>).detail;
			writeTheme(detail);
		};

		const handleStorage = (event: StorageEvent) => {
			if (event.key === themePresetStorageKey) writeTheme(event.newValue);
		};

		window.addEventListener(themePresetChangeEvent, handleThemeChange);
		window.addEventListener('storage', handleStorage);

		return () => {
			window.removeEventListener(themePresetChangeEvent, handleThemeChange);
			window.removeEventListener('storage', handleStorage);
		};
	});
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags, prefer-template -->
	{@html initialThemePresetScript}
</svelte:head>
