<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import Code2Icon from '@lucide/svelte/icons/code-2';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
</script>

<section class="py-24 sm:py-32">
	<div class="mx-auto max-w-6xl px-6">
		<div
			class="grid gap-8 rounded-2xl bg-primary px-7 py-12 text-primary-foreground sm:px-12 lg:grid-cols-[1fr_auto] lg:items-center"
		>
			<div>
				<h2 class="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
					Your product can start at the interesting part.
				</h2>
				<p class="mt-4 max-w-2xl text-base leading-7 text-primary-foreground/70">
					Clone the foundation, connect your services, and replace the sample product with yours.
				</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<Button href={resolve('/auth/sign-up')} variant="secondary" size="lg">
					Start building
					<ArrowRightIcon data-icon="inline-end" />
				</Button>
				<Button href="https://github.com/rodrgds/productplate" variant="secondary" size="lg">
					<Code2Icon data-icon="inline-start" />
					GitHub
				</Button>
			</div>
		</div>
	</div>
</section>
