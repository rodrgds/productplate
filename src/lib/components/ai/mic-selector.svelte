<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { setContext } from 'svelte';
	import type { ComponentProps } from 'svelte';
	import { contextKeys } from './ai-contexts.js';

	let {
		defaultValue,
		value: controlledValue,
		onValueChange: controlledOnValueChange,
		defaultOpen = false,
		open: controlledOpen,
		onOpenChange: controlledOnOpenChange,
		children
	}: ComponentProps<typeof Popover.Root> & {
		defaultValue?: string;
		value?: string | undefined;
		onValueChange?: (value: string | undefined) => void;
		defaultOpen?: boolean;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
	} = $props();

	let open = $state(controlledOpen ?? defaultOpen);
	let value = $state<string | undefined>(controlledValue ?? defaultValue);
	let width = $state(200);
	let devices = $state<MediaDeviceInfo[]>([]);
	let loading = $state(true);
	let hasPermission = $state(false);

	async function loadDevicesWithoutPermission() {
		try {
			loading = true;
			const deviceList = await navigator.mediaDevices.enumerateDevices();
			devices = deviceList.filter((device) => device.kind === 'audioinput');
		} catch (e) {
			console.error('Error getting audio devices:', e);
		} finally {
			loading = false;
		}
	}

	async function loadDevicesWithPermission() {
		if (loading) return;
		try {
			loading = true;
			const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
			for (const track of tempStream.getTracks()) {
				track.stop();
			}
			const deviceList = await navigator.mediaDevices.enumerateDevices();
			devices = deviceList.filter((device) => device.kind === 'audioinput');
			hasPermission = true;
		} catch (e) {
			console.error('Error getting audio devices:', e);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadDevicesWithoutPermission();
	});

	$effect(() => {
		if (open && !hasPermission && !loading) {
			loadDevicesWithPermission();
		}
	});

	$effect(() => {
		const handleDeviceChange = () => {
			if (hasPermission) {
				loadDevicesWithPermission();
			} else {
				loadDevicesWithoutPermission();
			}
		};
		navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
		return () => {
			navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
		};
	});

	function handleOpenChange(newOpen: boolean) {
		open = newOpen;
		controlledOnOpenChange?.(newOpen);
	}

	function handleValueChange(newValue: string) {
		value = newValue;
		controlledOnValueChange?.(newValue);
	}

	function setWidth(newWidth: number) {
		width = newWidth;
	}

	setContext(contextKeys.micSelector, {
		get devices() {
			return devices;
		},
		get value() {
			return value;
		},
		onValueChange: handleValueChange,
		get open() {
			return open;
		},
		onOpenChange: handleOpenChange,
		get width() {
			return width;
		},
		setWidth,
		get loading() {
			return loading;
		},
		get hasPermission() {
			return hasPermission;
		},
		loadDevices: loadDevicesWithPermission
	});
</script>

<Popover.Root {open} onOpenChange={handleOpenChange}>
	{@render children?.()}
</Popover.Root>
