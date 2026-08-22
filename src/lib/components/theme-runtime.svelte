<script lang="ts">
	import { browser } from '$app/environment';
	import {
		createInitialThemePresetExpression,
		defaultThemePreset,
		encodeThemePreset,
		getThemeRuntimeCss,
		parseThemePreset,
		revealInitialTheme,
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
		// SAFETY: getElementById returns null for missing ids; the null case is handled below.
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
		void revealInitialTheme();

		const handleThemeChange = (event: Event) => {
			if (!('detail' in event)) return;
			// SAFETY: themePresetChangeEvent always dispatches the preset code string.
			writeTheme(event.detail as string);
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
	<!-- svelte-ignore hydration_html_changed -->
	{@html initialThemePresetScript}
</svelte:head>
