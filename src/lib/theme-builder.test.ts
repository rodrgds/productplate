import { describe, expect, it } from 'vitest';
import {
	encodeThemePreset,
	getThemeRuntimeCss,
	setInitialThemePreset,
	themePresetStorageKey,
	themeRuntimeStyleElementId,
	type ThemePreset
} from './theme-builder.js';

describe('theme runtime bootstrap', () => {
	it('applies a saved preset before Svelte mounts', () => {
		const preset: ThemePreset = {
			style: 'compact',
			baseColor: 'mauve',
			accentColor: 'emerald',
			chartColor: 'violet',
			radius: 'large',
			font: 'manrope',
			headingFont: 'archivo',
			menuAccent: 'bold',
			menuColor: 'inverted'
		};
		const presetCode = encodeThemePreset(preset);

		localStorage.setItem(themePresetStorageKey, presetCode);
		setInitialThemePreset();

		const styleElement = document.getElementById(themeRuntimeStyleElementId);

		expect(styleElement?.textContent).toBe(getThemeRuntimeCss(preset));
		expect(document.documentElement.dataset.productPlatePreset).toBe(presetCode);
	});
});
