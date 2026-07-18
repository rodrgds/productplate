import { play, setEnabled, type SoundName } from 'cuelume';

export const soundEffectsStorageKey = 'product-plate-sound-effects';

interface SoundPreferenceStorage {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
}

export interface SoundEngine {
	play(name: SoundName): void;
	setEnabled(enabled: boolean): void;
}

const cuelumeEngine: SoundEngine = { play, setEnabled };

export class SoundPreferences {
	enabled = $state(false);

	private initialized = false;
	private storage: SoundPreferenceStorage | null = null;

	constructor(private readonly engine: SoundEngine = cuelumeEngine) {}

	initialize(storage = this.getBrowserStorage()) {
		if (this.initialized) return;

		this.storage = storage;
		this.enabled = this.readPreference() === 'on';
		this.engine.setEnabled(this.enabled);
		this.initialized = true;
	}

	setPreference(enabled: boolean) {
		if (!this.initialized) this.initialize();
		if (enabled === this.enabled) return;

		if (enabled) {
			this.enabled = true;
			this.engine.setEnabled(true);
			this.engine.play('toggle');
		} else {
			this.engine.play('toggle');
			this.enabled = false;
			this.engine.setEnabled(false);
		}

		this.writePreference(enabled ? 'on' : 'off');
	}

	play(name: SoundName) {
		if (!this.enabled) return;
		this.engine.play(name);
	}

	private getBrowserStorage(): SoundPreferenceStorage | null {
		return typeof localStorage === 'undefined' ? null : localStorage;
	}

	private readPreference() {
		try {
			return this.storage?.getItem(soundEffectsStorageKey) ?? null;
		} catch {
			return null;
		}
	}

	private writePreference(value: 'on' | 'off') {
		try {
			this.storage?.setItem(soundEffectsStorageKey, value);
		} catch {
			// Storage can be unavailable in hardened browsing modes; sound still works for this session.
		}
	}
}

export const soundPreferences = new SoundPreferences();
