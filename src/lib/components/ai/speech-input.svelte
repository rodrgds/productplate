<script lang="ts" module>
	interface SpeechRecognition extends EventTarget {
		continuous: boolean;
		interimResults: boolean;
		lang: string;
		start(): void;
		stop(): void;
		onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
		onend: ((this: SpeechRecognition, ev: Event) => void) | null;
		onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
		onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
	}

	interface SpeechRecognitionEvent extends Event {
		results: SpeechRecognitionResultList;
		resultIndex: number;
	}

	interface SpeechRecognitionResultList {
		readonly length: number;
		item(index: number): SpeechRecognitionResult;
		[index: number]: SpeechRecognitionResult;
	}

	interface SpeechRecognitionResult {
		readonly length: number;
		item(index: number): SpeechRecognitionAlternative;
		[index: number]: SpeechRecognitionAlternative;
		isFinal: boolean;
	}

	interface SpeechRecognitionAlternative {
		transcript: string;
		confidence: number;
	}

	interface SpeechRecognitionErrorEvent extends Event {
		error: string;
	}

	declare global {
		interface Window {
			SpeechRecognition: new () => SpeechRecognition;
			webkitSpeechRecognition: new () => SpeechRecognition;
		}
	}
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { MicIcon, SquareIcon } from '@lucide/svelte';
	import { cn } from '$lib/utils.js';
	import type { ComponentProps } from 'svelte';

	type SpeechInputMode = 'speech-recognition' | 'media-recorder' | 'none';

	let {
		class: className,
		onTranscriptionChange,
		onAudioRecorded,
		lang = 'en-US',
		...restProps
	}: Omit<ComponentProps<typeof Button>, 'onclick'> & {
		onTranscriptionChange?: (text: string) => void;
		onAudioRecorded?: (audioBlob: Blob) => Promise<string>;
		lang?: string;
	} = $props();

	let isListening = $state(false);
	let isProcessing = $state(false);
	let isRecognitionReady = $state(false);
	let mode: SpeechInputMode = $state('none');

	let recognition: SpeechRecognition | null = $state(null);
	let mediaRecorder: MediaRecorder | null = $state(null);
	let stream: MediaStream | null = $state(null);
	let audioChunks: Blob[] = $state([]);

	function detectSpeechInputMode(): SpeechInputMode {
		if (typeof window === 'undefined') return 'none';
		if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
			return 'speech-recognition';
		if ('MediaRecorder' in window && 'mediaDevices' in navigator) return 'media-recorder';
		return 'none';
	}

	mode = detectSpeechInputMode();

	$effect(() => {
		if (mode !== 'speech-recognition') return;

		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		const sr = new SpeechRecognition();
		sr.continuous = true;
		sr.interimResults = true;
		sr.lang = lang;

		sr.addEventListener('start', () => {
			isListening = true;
		});
		sr.addEventListener('end', () => {
			isListening = false;
		});
		sr.addEventListener('result', (event: Event) => {
			const speechEvent = event as SpeechRecognitionEvent;
			let finalTranscript = '';
			for (let i = speechEvent.resultIndex; i < speechEvent.results.length; i++) {
				const result = speechEvent.results[i];
				if (result.isFinal) {
					finalTranscript += result[0]?.transcript ?? '';
				}
			}
			if (finalTranscript) {
				onTranscriptionChange?.(finalTranscript);
			}
		});
		sr.addEventListener('error', () => {
			isListening = false;
		});

		recognition = sr;
		isRecognitionReady = true;

		return () => {
			sr.stop();
			recognition = null;
			isRecognitionReady = false;
		};
	});

	$effect(() => {
		return () => {
			if (mediaRecorder?.state === 'recording') {
				mediaRecorder.stop();
			}
			if (stream) {
				for (const track of stream.getTracks()) {
					track.stop();
				}
			}
		};
	});

	async function startMediaRecorder() {
		if (!onAudioRecorded) return;
		try {
			const s = await navigator.mediaDevices.getUserMedia({ audio: true });
			stream = s;
			const mr = new MediaRecorder(s);
			audioChunks = [];

			mr.addEventListener('dataavailable', (event: BlobEvent) => {
				if (event.data.size > 0) {
					audioChunks = [...audioChunks, event.data];
				}
			});

			mr.addEventListener('stop', async () => {
				if (stream) {
					for (const track of stream.getTracks()) {
						track.stop();
					}
				}
				stream = null;

				const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
				if (audioBlob.size > 0) {
					isProcessing = true;
					try {
						const transcript = await onAudioRecorded(audioBlob);
						if (transcript) {
							onTranscriptionChange?.(transcript);
						}
					} catch {
						// Error handling delegated to caller
					} finally {
						isProcessing = false;
					}
				}
			});

			mr.addEventListener('error', () => {
				isListening = false;
				if (stream) {
					for (const track of stream.getTracks()) {
						track.stop();
					}
				}
				stream = null;
			});

			mediaRecorder = mr;
			mr.start();
			isListening = true;
		} catch {
			isListening = false;
		}
	}

	function stopMediaRecorder() {
		if (mediaRecorder?.state === 'recording') {
			mediaRecorder.stop();
		}
		isListening = false;
	}

	function toggleListening() {
		if (mode === 'speech-recognition' && recognition) {
			if (isListening) {
				recognition.stop();
			} else {
				recognition.start();
			}
		} else if (mode === 'media-recorder') {
			if (isListening) {
				stopMediaRecorder();
			} else {
				startMediaRecorder();
			}
		}
	}

	const isDisabled = $derived(
		mode === 'none' ||
			(mode === 'speech-recognition' && !isRecognitionReady) ||
			(mode === 'media-recorder' && !onAudioRecorded) ||
			isProcessing
	);
</script>

<div class="relative inline-flex items-center justify-center">
	{#if isListening}
		{#each [0, 1, 2] as index (index)}
			<div
				class="absolute inset-0 animate-ping rounded-full border-2 border-red-400/30"
				style="animation-delay: {index * 0.3}s; animation-duration: 2s;"
			></div>
		{/each}
	{/if}

	<Button
		class={cn(
			'relative z-10 rounded-full transition-all duration-300',
			isListening
				? 'bg-destructive text-white hover:bg-destructive/80 hover:text-white'
				: 'bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground',
			className
		)}
		disabled={isDisabled}
		onclick={toggleListening}
		{...restProps}
	>
		{#if isProcessing}
			<div
				class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
			></div>
		{:else if isListening}
			<SquareIcon class="size-4" />
		{:else}
			<MicIcon class="size-4" />
		{/if}
	</Button>
</div>
