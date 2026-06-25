<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import Code2Icon from '@lucide/svelte/icons/code-2';
	import { Button } from '$lib/components/ui/button';
</script>

<section class="py-20 sm:py-28">
	<div class="mx-auto max-w-6xl px-6">
		<div
			class="grid gap-8 rounded-2xl bg-primary px-7 py-12 text-primary-foreground selection:bg-primary-foreground/25 selection:text-primary sm:px-12 lg:grid-cols-[1fr_auto] lg:items-center"
		>
			<div>
				<h2 class="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
					Clone it. Kickstart it. Keep only what matters.
				</h2>
				<p class="mt-4 max-w-2xl text-base leading-7 text-primary-foreground/70">
					Use Product Plate as the base, then let the kickstart prompt turn it into your product.
				</p>
			</div>
			<div class="flex flex-wrap gap-3">
				<Button href="https://github.com/rodrgds/productplate" variant="secondary" size="lg">
					<Code2Icon data-icon="inline-start" />
					GitHub
				</Button>
				<Button
					href="https://github.com/rodrgds/productplate/blob/main/START_HERE.md"
					variant="secondary"
					size="lg"
				>
					Read Kickstart
					<ArrowRightIcon data-icon="inline-end" />
				</Button>
			</div>
		</div>
	</div>
</section>
