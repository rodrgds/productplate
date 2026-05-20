<script lang="ts">
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { BriefcaseIcon, FileTextIcon } from '@lucide/svelte';

	let { data } = $props();
	const profile = $derived(data.profile);

	const initials = $derived(
		profile.displayName
			.split(' ')
			.map((n: string) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	);
</script>

<div class="flex min-h-screen flex-col items-center bg-muted/30">
	<div class="w-full max-w-2xl px-4 py-16">
		<div class="flex flex-col items-center gap-6 rounded-xl border bg-card p-12 shadow-sm">
			<Avatar class="size-24">
				<AvatarImage src={profile.image ?? undefined} alt={profile.displayName} />
				<AvatarFallback class="text-2xl">{initials}</AvatarFallback>
			</Avatar>

			<div class="flex flex-col items-center gap-1">
				<h1 class="text-2xl font-semibold">{profile.displayName}</h1>
				{#if profile.role}
					<Badge variant="secondary" class="gap-1">
						<BriefcaseIcon class="size-3" />
						{profile.role}
					</Badge>
				{/if}
			</div>

			<Separator />

			{#if profile.bio}
				<div class="w-full space-y-2">
					<div class="flex items-center gap-2 text-sm text-muted-foreground">
						<FileTextIcon class="size-4" />
						<span>About</span>
					</div>
					<p class="text-center leading-relaxed text-muted-foreground">{profile.bio}</p>
				</div>
			{/if}
		</div>
	</div>
</div>
