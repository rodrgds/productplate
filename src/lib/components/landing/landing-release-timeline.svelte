<script lang="ts">
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import GitCommitIcon from '@lucide/svelte/icons/git-commit-horizontal';
	import RocketIcon from '@lucide/svelte/icons/rocket';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	interface ReleaseEntry {
		version: string;
		date: string;
		title: string;
		description: string;
		changes: readonly string[];
	}

	interface Props {
		kicker?: string;
		title?: string;
		description?: string;
		releases?: readonly ReleaseEntry[];
		ctaLabel?: string;
		ctaHref?: string;
	}

	let {
		kicker = 'Shipping momentum',
		title = 'Give buyers proof that the product keeps moving.',
		description = 'A release-led proof section turns the changelog into a reason to trust the team behind the product.',
		releases = [
			{
				version: '2.8',
				date: 'July 2026',
				title: 'Customer briefs',
				description:
					'A prepared account summary that gathers open work, risks, and recent decisions before every review.',
				changes: ['Scheduled delivery', 'Source-linked summaries', 'Workspace templates']
			},
			{
				version: '2.7',
				date: 'June 2026',
				title: 'Workflow conditions',
				description:
					'Route work using account, owner, plan, and request metadata without writing custom rules.',
				changes: ['Visual rule builder', 'Dry-run preview', 'Change history']
			},
			{
				version: '2.6',
				date: 'May 2026',
				title: 'Shared customer views',
				description:
					'Publish a focused progress view for customers while keeping internal context private.',
				changes: ['Custom domains', 'Viewer permissions', 'Update subscriptions']
			}
		],
		ctaLabel = 'Browse the changelog',
		ctaHref = '/changelog'
	}: Props = $props();
</script>

<section class="border-b py-20 sm:py-24">
	<div class="mx-auto max-w-7xl px-6">
		<div class="release-heading">
			<div>
				<Badge variant="outline">
					<GitCommitIcon />
					{kicker}
				</Badge>
				<h2>{title}</h2>
			</div>
			<div>
				<p>{description}</p>
				<Button href={ctaHref} variant="outline" class="mt-6">
					{ctaLabel}
					<ArrowRightIcon data-icon="inline-end" />
				</Button>
			</div>
		</div>

		<div class="release-layout mt-12">
			<div class="release-list">
				{#each releases as release, index (release.version)}
					<article>
						<div class="release-marker">
							<span>{index === 0 ? 'Now' : release.date.split(' ')[0]}</span>
							<i class:current={index === 0}></i>
						</div>
						<div class="release-copy">
							<div class="flex flex-wrap items-center gap-2">
								<Badge variant={index === 0 ? 'secondary' : 'outline'}>v{release.version}</Badge>
								<span>{release.date}</span>
							</div>
							<h3>{release.title}</h3>
							<p>{release.description}</p>
							<ul>
								{#each release.changes as change (change)}
									<li><CheckIcon class="size-3.5 text-primary" />{change}</li>
								{/each}
							</ul>
						</div>
					</article>
				{/each}
			</div>

			<aside class="release-preview">
				<div class="preview-topbar">
					<div class="flex items-center gap-2">
						<span
							class="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground"
						>
							<RocketIcon class="size-3.5" />
						</span>
						<strong>What’s new</strong>
					</div>
					<Badge variant="secondary">v{releases[0]?.version ?? '2.8'}</Badge>
				</div>
				<div class="preview-body">
					<p class="text-xs font-medium text-muted-foreground">Latest release</p>
					<h3>{releases[0]?.title ?? 'Customer briefs'}</h3>
					<p>{releases[0]?.description}</p>
					<div class="preview-window">
						<div class="flex items-center justify-between gap-3 border-b px-4 py-3">
							<div>
								<span>Account brief</span>
								<strong>Northstar Labs</strong>
							</div>
							<Badge variant="outline">Ready</Badge>
						</div>
						<div class="preview-lines">
							<div><span class="w-3/4"></span><span class="w-1/2"></span></div>
							<div><span class="w-2/3"></span><span class="w-5/6"></span></div>
							<div><span class="w-1/2"></span><span class="w-3/4"></span></div>
						</div>
					</div>
				</div>
			</aside>
		</div>
	</div>
</section>

<style>
	.release-heading {
		display: grid;
		gap: 2rem;
		align-items: end;
	}

	.release-heading h2 {
		max-width: 42rem;
		margin-top: 1.25rem;
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 650;
		line-height: 1.02;
		letter-spacing: -0.045em;
		text-wrap: balance;
	}

	.release-heading > div:last-child > p {
		max-width: 35rem;
		color: var(--muted-foreground);
		line-height: 1.7;
	}

	.release-layout {
		display: grid;
		gap: 1.5rem;
		align-items: start;
	}

	.release-list {
		display: grid;
	}

	.release-list article {
		display: grid;
		grid-template-columns: 3rem minmax(0, 1fr);
		gap: 1rem;
	}

	.release-marker {
		position: relative;
		display: flex;
		align-items: center;
		flex-direction: column;
	}

	.release-marker span {
		font-size: 0.68rem;
		font-weight: 650;
		color: var(--muted-foreground);
	}

	.release-marker i {
		position: relative;
		display: block;
		size: 0.65rem;
		margin-top: 0.8rem;
		border: 2px solid var(--background);
		border-radius: 999px;
		background: var(--muted-foreground);
		box-shadow: 0 0 0 1px var(--border);
	}

	.release-marker i.current {
		background: var(--primary);
		box-shadow: 0 0 0 4px color-mix(in oklch, var(--primary) 15%, transparent);
	}

	.release-marker::after {
		position: absolute;
		top: 3rem;
		bottom: 0;
		left: 50%;
		width: 1px;
		background: var(--border);
		content: '';
	}

	.release-list article:last-child .release-marker::after {
		display: none;
	}

	.release-copy {
		padding-bottom: 2.5rem;
	}

	.release-copy > div > span {
		font-size: 0.72rem;
		color: var(--muted-foreground);
	}

	.release-copy h3 {
		margin-top: 1rem;
		font-size: 1.35rem;
		font-weight: 650;
		letter-spacing: -0.025em;
	}

	.release-copy > p {
		max-width: 40rem;
		margin-top: 0.6rem;
		color: var(--muted-foreground);
		font-size: 0.9rem;
		line-height: 1.65;
	}

	.release-copy ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem 1rem;
		margin-top: 1rem;
	}

	.release-copy li {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.75rem;
		font-weight: 550;
	}

	.release-preview {
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--card);
		box-shadow: 0 20px 44px color-mix(in oklch, var(--foreground) 8%, transparent);
	}

	.preview-topbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid var(--border);
		padding: 1rem;
	}

	.preview-topbar strong {
		font-size: 0.85rem;
	}

	.preview-body {
		padding: clamp(1.25rem, 4vw, 2rem);
	}

	.preview-body > h3 {
		margin-top: 0.5rem;
		font-size: 1.65rem;
		font-weight: 650;
		letter-spacing: -0.03em;
	}

	.preview-body > p:last-of-type {
		margin-top: 0.75rem;
		color: var(--muted-foreground);
		font-size: 0.85rem;
		line-height: 1.65;
	}

	.preview-window {
		overflow: hidden;
		margin-top: 1.5rem;
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		background: var(--background);
	}

	.preview-window span,
	.preview-window strong {
		display: block;
		font-size: 0.72rem;
	}

	.preview-window strong {
		margin-top: 0.2rem;
		font-weight: 650;
	}

	.preview-lines {
		display: grid;
		gap: 0.75rem;
		padding: 1rem;
	}

	.preview-lines div {
		display: grid;
		gap: 0.35rem;
		border-radius: 0.5rem;
		background: var(--muted);
		padding: 0.75rem;
	}

	.preview-lines span {
		display: block;
		height: 0.35rem;
		border-radius: 999px;
		background: var(--muted-foreground);
		opacity: 0.28;
	}

	@media (min-width: 900px) {
		.release-heading {
			grid-template-columns: 1fr 0.72fr;
		}

		.release-layout {
			grid-template-columns: minmax(0, 1.1fr) minmax(21rem, 0.9fr);
		}

		.release-preview {
			position: sticky;
			top: 6rem;
		}
	}
</style>
