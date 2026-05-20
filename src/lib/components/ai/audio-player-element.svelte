<script lang="ts">
	import type { Experimental_SpeechResult as SpeechResult } from 'ai';
	import type { HTMLAttributes } from 'svelte/elements';

	export type AudioPlayerElementProps = Omit<HTMLAttributes<HTMLAudioElement>, 'src'> & {
		data?: SpeechResult['audio'];
		src?: string;
	};

	let { data, src, ...restProps }: AudioPlayerElementProps = $props();

	const audioSrc = $derived(src ? src : data ? `data:${data.mediaType};base64,${data.base64}` : '');
</script>

<audio data-slot="audio-player-element" src={audioSrc} {...restProps}></audio>
