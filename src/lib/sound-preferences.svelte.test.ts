import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SoundName } from 'cuelume';
import {
	SoundPreferences,
	soundEffectsStorageKey,
	type SoundEngine
} from './sound-preferences.svelte.js';

function createEngine() {
	return {
		play: vi.fn<(name: SoundName) => void>(),
		setEnabled: vi.fn<(enabled: boolean) => void>()
	} satisfies SoundEngine;
}

describe('sound preferences', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('defaults to muted until the user opts in', () => {
		const engine = createEngine();
		const preferences = new SoundPreferences(engine);

		preferences.initialize(localStorage);

		expect(preferences.enabled).toBe(false);
		expect(engine.setEnabled).toHaveBeenCalledWith(false);
		expect(engine.play).not.toHaveBeenCalled();
	});

	it('restores an enabled preference without playing on page load', () => {
		localStorage.setItem(soundEffectsStorageKey, 'on');
		const engine = createEngine();
		const preferences = new SoundPreferences(engine);

		preferences.initialize(localStorage);

		expect(preferences.enabled).toBe(true);
		expect(engine.setEnabled).toHaveBeenCalledWith(true);
		expect(engine.play).not.toHaveBeenCalled();
	});

	it('persists opt-in changes and previews the toggle cue once', () => {
		const engine = createEngine();
		const preferences = new SoundPreferences(engine);
		preferences.initialize(localStorage);

		preferences.setPreference(true);

		expect(localStorage.getItem(soundEffectsStorageKey)).toBe('on');
		expect(engine.setEnabled).toHaveBeenLastCalledWith(true);
		expect(engine.play).toHaveBeenCalledOnce();
		expect(engine.play).toHaveBeenCalledWith('toggle');
	});

	it('plays the toggle cue before muting and suppresses future feedback', () => {
		localStorage.setItem(soundEffectsStorageKey, 'on');
		const engine = createEngine();
		const preferences = new SoundPreferences(engine);
		preferences.initialize(localStorage);

		preferences.setPreference(false);
		preferences.play('success');

		expect(localStorage.getItem(soundEffectsStorageKey)).toBe('off');
		expect(engine.play).toHaveBeenCalledTimes(1);
		expect(engine.play).toHaveBeenCalledWith('toggle');
		expect(engine.setEnabled).toHaveBeenLastCalledWith(false);
	});

	it('plays semantic feedback only while enabled', () => {
		localStorage.setItem(soundEffectsStorageKey, 'on');
		const engine = createEngine();
		const preferences = new SoundPreferences(engine);
		preferences.initialize(localStorage);

		preferences.play('success');
		preferences.play('error');

		expect(engine.play).toHaveBeenNthCalledWith(1, 'success');
		expect(engine.play).toHaveBeenNthCalledWith(2, 'error');
	});

	it('does not replay the toggle cue when the preference is unchanged', () => {
		const engine = createEngine();
		const preferences = new SoundPreferences(engine);
		preferences.initialize(localStorage);

		preferences.setPreference(false);

		expect(engine.play).not.toHaveBeenCalled();
		expect(localStorage.getItem(soundEffectsStorageKey)).toBeNull();
	});
});
