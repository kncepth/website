<script lang="ts">
	import EditLink from '$lib/components/EditLink.svelte';
	import Glyph from '$lib/components/Glyph.svelte';
	import ThemeCard from '$lib/components/ThemeCard.svelte';
	import { themes } from '$lib/data/themes';
	import { onMount, untrack } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	/** The counts each card shows, which go up as soon as someone here takes a theme. */
	let downloads = $state(untrack(() => data.downloads));
	/**
	 * The gallery in order of the counts the build saw. Live counts never reorder it, so the cards
	 * stay where the prerendered page put them.
	 */
	const sorted = themes.toSorted(
		(a, b) => (data.downloads?.[b.id] ?? 0) - (data.downloads?.[a.id] ?? 0)
	);
	const compact = new Intl.NumberFormat('en', { notation: 'compact' });

	/** How many cards a page of the gallery holds, three full rows at the widest layout. */
	const PAGE_SIZE = 12;

	let query = $state('');
	/** The page shown, counted from 0. */
	let current = $state(0);
	let top: HTMLElement | undefined = $state();

	/** The themes whose name, variant names or authors contain every word of the query. */
	const found = $derived.by(() => {
		const words = query.toLowerCase().split(/\s+/).filter(Boolean);
		if (!words.length) return sorted;
		return sorted.filter((theme) => {
			const text = [theme.name, ...theme.authors, ...theme.variants.map((v) => v.name)]
				.join(' ')
				.toLowerCase();
			return words.every((word) => text.includes(word));
		});
	});
	const pages = $derived(Math.max(1, Math.ceil(found.length / PAGE_SIZE)));
	const shown = $derived(found.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE));

	/** Shows page `index` and scrolls back up to the search field. */
	function go(index: number) {
		current = Math.min(Math.max(index, 0), pages - 1);
		top?.scrollIntoView({ block: 'start', behavior: 'smooth' });
	}

	onMount(async () => {
		try {
			const res = await fetch('/api/themes/downloads');
			if (res.ok) downloads = await res.json();
		} catch {}
	});

	/** Counts an install or download of theme `id` and shows the new count. */
	async function record(id: string) {
		try {
			const res = await fetch(`/api/themes/${id}/download`, { method: 'POST', keepalive: true });
			if (res.ok) downloads = { ...downloads, [id]: (await res.json()).count };
		} catch {}
	}
</script>

<svelte:head>
	<title>Community themes · Sonora</title>
	<meta
		name="description"
		content="Themes for Sonora that people made and shared. Install one with a click."
	/>
</svelte:head>

<section class="section">
	<span class="cross start"></span>
	<span class="cross end"></span>

	<div class="page gallery">
		<header>
			<span class="kicker">Themes</span>
			<h1>Community themes</h1>
			<p class="summary">
				Want to contribute? <a href="/docs/themes#format">Write a theme</a>, then
				<a href="/themes/submit">submit it</a>.
			</p>
		</header>

		<label class="search" bind:this={top}>
			<Glyph name="search" size={14} />
			<input
				type="search"
				placeholder="Search themes or authors"
				aria-label="Search themes"
				bind:value={query}
				oninput={() => (current = 0)}
			/>
		</label>

		{#if !found.length}
			<p class="empty">No theme matches "{query.trim()}".</p>
		{/if}

		<ul class="grid">
			{#each shown as theme (theme.id)}
				<ThemeCard
					tag="li"
					name={theme.name}
					authors={theme.authors}
					github={theme.github}
					variants={theme.variants}
				>
					{#snippet meta()}
						{#if downloads}
							{@const count = downloads[theme.id] ?? 0}
							<span class="downloads" title="{count} {count === 1 ? 'download' : 'downloads'}">
								<Glyph name="arrow-down" size={12} />
								{compact.format(count)}
							</span>
						{/if}
					{/snippet}
					{#snippet actions()}
						<a class="btn btn-primary" href={theme.link} onclick={() => record(theme.id)}>
							Install
							<Glyph name="arrow-right" />
						</a>
						<a
							class="btn btn-secondary"
							href={theme.download.href}
							download={theme.download.name}
							onclick={() => record(theme.id)}
						>
							Download
							<Glyph name="arrow-down" />
						</a>
					{/snippet}
				</ThemeCard>
			{/each}
		</ul>

		{#if pages > 1}
			<nav class="pager" aria-label="Pages">
				<button
					type="button"
					class="btn btn-secondary"
					aria-label="Previous page"
					disabled={current === 0}
					onclick={() => go(current - 1)}
				>
					<Glyph name="chevron-left" />
				</button>
				{#each { length: pages }, index (index)}
					<button
						type="button"
						class="btn {index === current ? 'btn-primary' : 'btn-secondary'}"
						aria-current={index === current ? 'page' : undefined}
						onclick={() => go(index)}
					>
						{index + 1}
					</button>
				{/each}
				<button
					type="button"
					class="btn btn-secondary"
					aria-label="Next page"
					disabled={current === pages - 1}
					onclick={() => go(current + 1)}
				>
					<Glyph name="chevron-right" />
				</button>
			</nav>
		{/if}

		<div class="source">
			<EditLink path="src/routes/themes/+page.svelte" />
		</div>
	</div>
</section>

<style>
	.gallery {
		padding-top: 72px;
		padding-bottom: 96px;
	}

	header {
		max-width: 640px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 40px;
	}

	h1 {
		font-size: 36px;
	}

	.summary {
		font-size: 15px;
		line-height: 1.6;
		color: var(--muted-fg);
	}

	.summary a {
		color: var(--fg);
		text-decoration: underline;
		text-decoration-color: var(--faint);
		text-underline-offset: 3px;
	}

	.search {
		scroll-margin-top: calc(var(--header) + 24px);
		max-width: 360px;
		height: 40px;
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 24px;
		padding: 0 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--dim);
	}

	.search:focus-within {
		border-color: var(--muted-fg);
	}

	.search input {
		flex: 1;
		min-width: 0;
		border: 0;
		outline: 0;
		background: none;
		color: var(--fg);
		font: inherit;
		font-size: 14px;
	}

	.search input::placeholder {
		color: var(--dim);
	}

	.empty {
		font-size: 14px;
		color: var(--muted-fg);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 20px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.downloads {
		display: flex;
		flex: none;
		align-items: center;
		gap: 3px;
		font-size: 12px;
		font-variant-numeric: tabular-nums;
		color: var(--muted-fg);
	}

	.pager {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
		margin-top: 40px;
	}

	.pager .btn {
		min-width: 40px;
		padding: 0 12px;
		font-variant-numeric: tabular-nums;
	}

	.pager .btn:disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	.source {
		margin-top: 48px;
	}

	@media (max-width: 900px) {
		.gallery {
			padding-top: 48px;
			padding-bottom: 64px;
		}
	}
</style>
