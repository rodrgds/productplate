<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import Code2Icon from '@lucide/svelte/icons/code-2';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	const included = [
		'SvelteKit 2 and Svelte 5',
		'Convex realtime backend',
		'Better Auth and protected routes',
		'Autumn billing scaffolding',
		'AI SDK chat patterns',
		'60+ product and UI components',
		'Cloudflare deployment workflow',
		'Devenv reproducible toolchain'
	] as const;
</script>

<section id="open-source" class="border-y bg-muted/35 py-24 sm:py-32">
	<div class="mx-auto max-w-6xl px-6">
		<div class="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
			<div>
				<Badge variant="outline">MIT licensed</Badge>
				<h2 class="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
					Free to start. Yours to reshape.
				</h2>
				<p class="mt-5 text-lg leading-8 text-muted-foreground">
					No paid template license and no opaque package hiding the important parts. The components
					live in your repository, so you can inspect and change every detail.
				</p>
			</div>

			<Card.Root>
				<Card.Header>
					<Card.Action><Badge variant="secondary">$0</Badge></Card.Action>
					<Card.Title>Product Plate</Card.Title>
					<Card.Description>A practical foundation for your next SaaS.</Card.Description>
				</Card.Header>
				<Card.Content>
					<ul class="grid gap-3 sm:grid-cols-2">
						{#each included as item (item)}
							<li class="flex items-start gap-2 text-sm">
								<CheckIcon class="mt-0.5 size-4 shrink-0" />
								<span>{item}</span>
							</li>
						{/each}
					</ul>
				</Card.Content>
				<Card.Footer class="flex flex-wrap gap-3">
					<Button href={resolve('/auth/sign-up')} size="lg">Start building</Button>
					<Button href="https://github.com/rodrgds/productplate" variant="outline" size="lg">
						<Code2Icon data-icon="inline-start" />
						View source
					</Button>
				</Card.Footer>
			</Card.Root>
		</div>
	</div>
</section>
