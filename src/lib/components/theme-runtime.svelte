<script lang="ts">
	import { browser } from '$app/environment';
	import {
		defaultThemePreset,
		encodeThemePreset,
		getThemeRuntimeCss,
		parseThemePreset,
		themePresetChangeEvent,
		themePresetStorageKey
	} from '$lib/theme-builder.js';

	const styleElementId = 'product-plate-theme-runtime';
	const defaultPresetCode = encodeThemePreset(defaultThemePreset);

	function writeTheme(code: string | null | undefined) {
		if (!browser) return;

		const parsedPreset = parseThemePreset(code);
		const preset = parsedPreset ?? defaultThemePreset;
		const normalizedPresetCode =
			parsedPreset === null
				? defaultPresetCode
				: (code ?? defaultPresetCode).trim().replace(/^--preset\s+/, '');
		let styleElement = document.getElementById(styleElementId) as HTMLStyleElement | null;

		if (!styleElement) {
			styleElement = document.createElement('style');
			styleElement.id = styleElementId;
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
